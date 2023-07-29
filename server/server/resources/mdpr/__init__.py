import os
from flask_restful import Resource, reqparse
from server.config import Config


class MDPR(Resource):
    def get(self):
        mdpr_file_path = os.path.abspath(
            os.path.join(Config.MDP_LOCATION_FOLDER, "md_pr.mdp")
        )

        with open(mdpr_file_path, "r") as f:
            lines = f.readlines()

        if len(lines) > 0:
            for line in lines:
                if "nsteps" in line:
                    start_index = (
                        line.index("=") + 1
                    )  # Find the index of the "=" character and add 1 to skip it
                    end_index = line.index(";")  # Find the index of the ";" character
                    nsteps = int(line[start_index:end_index].strip())
                elif "dt" in line:
                    start_index = (
                        line.index("=") + 1
                    )  # Find the index of the "=" character and add 1 to skip it
                    end_index = line.index(";")  # Find the index of the ";" character
                    dt = float(line[start_index:end_index].strip())
                    break

            return {"status": "found", "nsteps": nsteps, "dt": dt}
        return {"status": "not-found"}

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
            for i, line in enumerate(lines):
                if "nsteps" in line and nsteps:
                    lines[i] = f"nsteps = {nsteps} ; 2 * 50000 = 1000 ps (1 ns) \n"
                elif "dt" in line and dt:
                    lines[i] = f"dt     = {dt}     ; 2 fs \n"
                    break

            if dt or nsteps:
                with open(mdpr_file_path, "w") as f:
                    f.writelines(lines)

                return {"status": "updated"}

        return {"status": "unchanged"}
