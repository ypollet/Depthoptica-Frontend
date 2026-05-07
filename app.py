from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    send_from_directory,
    abort,
)

from flask_cors import CORS, cross_origin

import os
import json
import base64

from PIL import Image
import cv2
import numpy as np
from scipy.ndimage import gaussian_filter1d
from scipy.signal import savgol_filter
import math

cwd = os.getcwd()

# configuration
DEBUG = True
DATA_FOLDER = f"{cwd}/data"

# instantiate the app
app = Flask(
    __name__,
    static_folder="dist/static",
    template_folder="dist",
    static_url_path="/static",
)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"
app.config.from_object(__name__)

# definitions
SITE = {"logo": "Depthoptica", "version": "1.0.0"}

OWNER = {
    "name": "Royal Belgian Institute of Natural Sciences",
}

# pass data to the frontend
site_data = {"site": SITE, "owner": OWNER}


# landing page
@app.route("/<id>")
def welcome(id):
    return render_template("index.html", **site_data)


# send full image
@app.route("/<id>/<image_id>/full-image")
@cross_origin()
def image(id, image_id):
    return send_from_directory(f"{DATA_FOLDER}/{id}", image_id)


# send depthmap
@app.route("/<id>/<image_id>/depthmap")
@cross_origin()
def depthmap(id, image_id):
    directory = f"{DATA_FOLDER}/{id}"
    if not os.path.exists(directory):
        abort(404)
    with open(f"{directory}/depth.json", "r") as f:
        stack_file = json.load(f)
    with Image.open(
        f"{directory}/{stack_file['stacked'][image_id]['depthmap']}") as im:
        pix = np.array(im)
    return jsonify(
        pix.tolist()
    )

# send layers
@app.route("/<id>/<image_id>/layers")
@cross_origin()
def layers(id, image_id):
    directory = f"{DATA_FOLDER}/{id}"
    if not os.path.exists(directory):
        abort(404)
    with open(f"{directory}/depth.json", "r") as f:
        stack_file = json.load(f)
    with open(
        f"{directory}/{stack_file['stacked'][image_id]['layers']}", "rb"
    ) as image_file:
        bytes = base64.b64encode(image_file.read())
    return f"data:image/png;base64,{bytes.decode('ascii')}"


# send thumbnail
@app.route("/<id>/<image_id>/thumbnail")
@cross_origin()
def thumbnail(id, image_id):
    return send_from_directory(f"{DATA_FOLDER}/{id}/thumbnails", image_id)


# send StackData
@app.route("/<id>/images")
@cross_origin()
def images(id):
    directory = f"{DATA_FOLDER}/{id}"
    if not os.path.exists(directory):
        abort(404)
    with open(f"{directory}/depth.json", "r") as f:
        stack_file = json.load(f)
    to_jsonify = {}

    encoded_images = []
    for image_id in stack_file["stacked"]:
        image_data = stack_file["stacked"][image_id]["data"]
        try :
            image_threshold = stack_file["stacked"][image_id]["edges"]["threshold"]
        except:
            image_threshold = None

        # file name of stacked image
        encoded_images.append(
            {
                "name": image_id,
                "label": image_data["label"],
                "size": {
                    "width": image_data["width"],
                    "height": image_data["height"],
                },
                "edgeThresholds": list(image_threshold.keys()) if image_threshold is not None else None
            }
        )
    to_jsonify["images"] = encoded_images
    to_jsonify["thumbnails"] = len(stack_file["thumbnails"]) != 0

    return jsonify(to_jsonify)


@app.route("/<id>/<image_id>/position")
@cross_origin()
def compute_landmark(id, image_id):
    x = float(request.args.get("x"))
    y = float(request.args.get("y"))


    directory = f"{DATA_FOLDER}/{id}"
    if not os.path.exists(directory):
        abort(404)
        
    with open(f"{directory}/depth.json", "r") as f:
        stack_file = json.load(f)
    image = stack_file["stacked"][image_id]
    image_data = image["data"]

    im = cv2.imread(f"{directory}/{image['depthmap']}", cv2.IMREAD_GRAYSCALE | cv2.IMREAD_ANYDEPTH)
    depth = im[round(y)][round(x)]
    position = {
            "x": x * image_data["PixelRatio"][0],
            "y": y * image_data["PixelRatio"][1],
            "z": ((image_data["Zmax"] - image_data["Zmin"]) / (2**(im.itemsize*8)) * depth) #65536
            + image_data["Zmin"],
        }
    
    return jsonify(position)

@app.route("/<id>/<image_id>/profile")
@cross_origin()
def compute_profile(id, image_id):
    x1 = float(request.args.get("x1"))
    y1 = float(request.args.get("y1"))

    x2 = float(request.args.get("x2"))
    y2 = float(request.args.get("y2"))

    threshold = request.args.get("threshold", "")  # String or None
    smooth_str = request.args.get("smooth", "true")
    match smooth_str.lower():
        case "false":
            smooth = False
        case _:
            smooth = True

    directory = f"{DATA_FOLDER}/{id}"
    if not os.path.exists(directory):
        abort(404)
    with open(f"{directory}/depth.json", "r") as f:
        stack_file = json.load(f)

    image = stack_file["stacked"][image_id]
    image_data = image["data"]



    subLandmarks = []
    im = cv2.imread(f"{directory}/{image['depthmap']}", cv2.IMREAD_GRAYSCALE | cv2.IMREAD_ANYDEPTH)
    mask = cv2.imread(f"{directory}/{image['mask']}", cv2.IMREAD_GRAYSCALE) if 'mask' in image else None
    edges = cv2.imread(f"{directory}/{image['edges']["image"]}", cv2.IMREAD_GRAYSCALE) if 'edges' in image else None
    edge_threshold = image['edges']["threshold"][threshold] if ('edges' in image and threshold in image['edges']["threshold"]) else 0
    list_distances = wu_line(x1, y1, x2, y2, im, mask, edges, edge_threshold)
    
    graphs_segments = []
    if len(list_distances) > 0:
        first_segment, _ = list_distances[0]

        last_segment, _ = list_distances[-1]
        start =  {
                "x": first_segment[0]["x"] * image_data["PixelRatio"][0],
                "y": first_segment[0]["y"]  * image_data["PixelRatio"][1],
                "z": ((image_data["Zmax"] - image_data["Zmin"]) / (2**(im.itemsize*8)) * first_segment[0]["z"]) + image_data["Zmin"]
            }

        end =  {
                "x": last_segment[-1]["x"] * image_data["PixelRatio"][0],
                "y": last_segment[-1]["y"]  * image_data["PixelRatio"][1],
                "z": ((image_data["Zmax"] - image_data["Zmin"]) / (2**(im.itemsize*8)) * last_segment[-1]["z"]) + image_data["Zmin"]
            }
        
        
        
        for distance in list_distances:
            subLandmarks, distance = distance[0], distance[1]
            subLandmarks = [ {
                "x": i["x"] * image_data["PixelRatio"][0],
                "y": i["y"]  * image_data["PixelRatio"][1],
                "z": ((image_data["Zmax"] - image_data["Zmin"]) / (2**(im.itemsize*8)) * i["z"]) + image_data["Zmin"]
            } for i in subLandmarks]

            line_3d = [ {
                "x": i["x"] - start["x"],
                "y": i["y"] - start["y"],
                "z": i["z"]
            } for i in subLandmarks]

            # Smooth line

            line_2d = np.array([
                [math.sqrt(point["x"]**2 + point["y"]**2), point["z"]] 
                for point in line_3d])
            if smooth:
                
                line_2d = smooth_array(line_2d, distance)

            graphs_segments.append([{
                "x": point[0],
                "y": point[1]
            } for point in line_2d.tolist()])
    else:
        start =  {
                "x": x1 * image_data["PixelRatio"][0],
                "y": y1  * image_data["PixelRatio"][1],
                "z": 0
            }
        end =  {
                    "x": x2 * image_data["PixelRatio"][0],
                    "y": y2  * image_data["PixelRatio"][1],
                    "z": 0
                }
    return jsonify({
        "start": start,
        "end" : end,
        "subLandmarkSegments": graphs_segments
    })

def wu_line(x0, y0, x1, y1, heightmap : np.ndarray, mask : np.ndarray | None, edges : np.ndarray | None, threshold = 0):
    horizontal = abs(y1 - y0) < abs(x1 - x0) # if x is longer than y
    
    inverse = x1 < x0 if horizontal else y1 < y0
    if inverse:
        # has to be a positive vector so swap start 
        # !!! need to inverse list order
        x0, x1 = x1, x0
        y0, y1 = y1, y0

    dx = x1 - x0
    dy = y1 - y0

    distance = dx if horizontal else dy
    numerator = dy if horizontal else dx

    gradient = numerator/distance if distance != 0 else 1

    list_distances = []

    

    # get integer point before start point
    ratio_start = int(x0) - x0 if horizontal else int(y0) - y0
    start_point = {
        "x" : int(x0) if horizontal else x0 + gradient*ratio_start,
        "y" : y0 + gradient*ratio_start if horizontal else int(y0)
    }

    start = 0
    length_line = int(distance)+1
    while start < length_line:

        list_pixels, distance, end = handle_distance(start, length_line, inverse, start_point, gradient, horizontal, heightmap, mask, edges, threshold)
        if len(list_pixels) > 0:  #not empty
            list_distances.append((list_pixels, distance))
        
        start = end 
    
    return list_distances


def handle_distance(i, length_line, inverse, start_point, gradient, horizontal, heightmap, mask, edges, threshold):
    list_pixels = []
    list_i = [] # get distance of each pixels added, to get the 2 furthest points
    while i < length_line:
        # iterate from int before start point to int after end point
        x = start_point["x"] + i if horizontal else start_point["x"] + i*gradient
        y = start_point["y"] + i*gradient if horizontal else start_point["y"] + i
        ix, iy = int(x), int(y)

        i += 1
        if masked(ix, iy, mask):
            break
        
        dist = y - iy  if horizontal else x - ix # swap dist if steep
        depth = getRatioedPixelHeight(ix, iy, 1.0 - dist, heightmap) + getRatioedPixelHeight(ix, iy+1, dist, heightmap) if horizontal else getRatioedPixelHeight(ix, iy, 1.0 - dist, heightmap) + getRatioedPixelHeight(ix+1, iy, dist, heightmap)
        isEdge = edges[iy,ix] >= threshold if edges is not None else True
        if isEdge:
            list_i.append(i-1)
            list_pixels.append(
                {
                    "x": x,
                    "y": y,
                    "z": depth,
                }
        )
        
    

    if inverse:
        list_pixels.reverse()
    
    return list_pixels, list_i[-1] - list_i[0] if len(list_i) else 0, i
    

def masked(x : int, y : int, mask : np.ndarray | None):
    return mask is not None and not mask[y,x]

def getRatioedPixelHeight(x : int, y : int, ratio : float, heightmap : np.ndarray):
    return heightmap[y,x] * ratio


def smooth_array(array, distance : float):
    x, y = array.T
    t = np.linspace(0, 1, len(x))
    t2 = np.linspace(0, 1, int(distance)*10)
    t3 = np.linspace(0, 1, 100)

    x2 = np.interp(t3, t, x)
    y2 = np.interp(t3, t, y)
    sigma = 1#int(distance)/10
    x3 = x2
    y3 = gaussian_filter1d(y2, sigma)

    """x4 = np.interp(t3, t2, x3).reshape((-1,1))
    y4 = np.interp(t3, t2, y3).reshape((-1,1))"""


    return np.concatenate((x3.reshape((-1,1)),y3.reshape((-1,1))),1)
if __name__ == "__main__":
    app.run()
