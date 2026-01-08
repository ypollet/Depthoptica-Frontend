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
import numpy as np
import time

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
SITE = {"logo": "Stackoptica", "version": "2.0.0"}

OWNER = {
    "name": "Royal Belgian Institute of Natural Sciences",
}

# pass data to the frontend
site_data = {"site": SITE, "owner": OWNER}


# landing page
@app.route("/<id>")
def welcome(id):
    print(f"id : {id}")
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
        print(image_id)
        image_data = stack_file["stacked"][image_id]["data"]

        with open(
            f"{directory}/{stack_file['stacked'][image_id]['layers']}", "rb"
        ) as image_file:
            layer_bytes = base64.b64encode(image_file.read())
        try:
            # file name of stacked image
            encoded_images.append(
                {
                    "name": image_id,
                    "label": image_data["label"],
                    "size": {
                        "width": image_data["width"],
                        "height": image_data["height"],
                    },
                }
            )
        except Exception as error:
            print(f"Error : {error}")
            continue
    print(encoded_images)
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

    
    with Image.open(f"{directory}/{image['depthmap']}") as im :
        depth = im.getpixel((round(x),round(y)))
        print(depth)
    position = {
            "x": x * image_data["PixelRatio"][0],
            "y": y * image_data["PixelRatio"][1],
            "z": ((image_data["Zmax"] - image_data["Zmin"]) / 65536 * depth) #65536
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

    nbr_steps = round(float(request.args.get("nbr_steps")))

    vector = {
            "x": x2 - x1,
            "y": y2 - y1
          }

    

    directory = f"{DATA_FOLDER}/{id}"
    if not os.path.exists(directory):
        abort(404)
    with open(f"{directory}/depth.json", "r") as f:
        stack_file = json.load(f)

    image_data = stack_file["stacked"][image_id]["data"]
    # z = ((image_data["Zmax"] - image_data["Zmin"]) / 256 * img[x, y]) + image_data["Zmin"] # depthmap
    # z * image_data["step"] # layers


    sub_landmarks = []

    with Image.open(f"{directory}/{image_data['depthmap']}") as depth :
        #depthmap = np.array(depth)
        #depth1 = depthmap[round(y1)][round(x1)]
        depth1 = depth.getpixel((round(x1),round(y1)))

        start = {
            "x": x1 * image_data["PixelRatio"][0],
            "y": y1 * image_data["PixelRatio"][1],
            "depth": ((image_data["Zmax"] - image_data["Zmin"]) / 65536 * depth1)
            + image_data["Zmin"],
        }

        for i in range(1, nbr_steps+1):
            next = {"x": x1 + vector["x"] * i / (nbr_steps + 1), "y": y1 + vector["y"] * i / (nbr_steps + 1)}

            #depth_cur = depthmap[round(next['y'])][round(next['x'])]
            depth_cur = depth.getpixel((round(next['x']),round(next['y'])))

            sub_landmarks.append(
                {
                    "x": next['x'] * image_data["PixelRatio"][0],
                    "y": next['y'] * image_data["PixelRatio"][1],
                    "depth": ((image_data["Zmax"] - image_data["Zmin"]) / 65536 * depth_cur)
                    + image_data["Zmin"],
                }
            )


        #depth2 = depthmap[round(y2)][round(x2)]
        depth2 = depth.getpixel((round(x2),round(y2)))

        end = {
            "x": x2 * image_data["PixelRatio"][0],
            "y": y2 * image_data["PixelRatio"][1],
            "depth": ((image_data["Zmax"] - image_data["Zmin"]) / 65536 * depth2)
            + image_data["Zmin"],
        }
    
    

    return jsonify({
        "start": start,
        "end" : end,
        "subLandmarks": sub_landmarks
    })


if __name__ == "__main__":
    app.run()
