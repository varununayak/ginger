from flask import Flask, request, jsonify, send_from_directory
from urdf_parser_py.urdf import URDF
import json

app = Flask(__name__, static_folder='../static')

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/parse_urdf', methods=['POST'])
def parse_urdf():
    urdf_file = request.files['urdf']
    robot = URDF.from_xml_string(urdf_file.read().decode('utf-8'))
    
    # Convert URDF to a JSON-serializable format
    robot_dict = {
        "links": [
            {
                "name": link.name,
                "visual": link.visual.geometry.box.size if link.visual and hasattr(link.visual.geometry, 'box') else None
            } for link in robot.links
        ],
        "joints": [
            {
                "name": joint.name,
                "type": joint.type,
                "parent": joint.parent,
                "child": joint.child,
                "origin": joint.origin.xyz + joint.origin.rpy if joint.origin else None
            } for joint in robot.joints
        ]
    }
    
    return jsonify(robot_dict)

if __name__ == '__main__':
    app.run(debug=True)