import os
from flask_restful import Resource, reqparse
from server.config import Config


class MDFilesUpdate(Resource):
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument("nsteps", required=False, type=str, location="form")
        parser.add_argument("dt", required=False, type=str, location="form")

        args = parser.parse_args()

        nsteps = args["nsteps"]
        dt = args["dt"]

        mdpr_file_path = os.path.abspath(
            os.path.join(Config.MDP_LOCATION_FOLDER, "md_pr.mdp")
        )

        with open(mdpr_file_path, "r") as f:
            lines = f.readlines()

        if len(lines) > 0:
            for i, text in enumerate(lines):
                if nsteps and text.find("nsteps") > -1:
                    lines[i] = f"nsteps = {nsteps} ; 2 * 50000 = 1000 ps (1 ns) \n"

                if dt and text.find("dt") > -1:
                    lines[i] = f"dt     = {dt}     ; 2 fs \n"

            if dt or nsteps:
                with open(mdpr_file_path, "w") as f:
                    f.writelines(lines)

                return {"status": "updated"}

        return {"status": "unchanged"}
