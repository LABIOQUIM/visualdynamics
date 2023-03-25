import shutil


def check_gromacs(double=False):
    if double:
        gmx = shutil.which("gmx_d") or shutil.which("gmx")
    else:
        gmx = shutil.which("gmx")
    if gmx is None:
        return "missing_gromacs"
    return gmx


def check_grace():
    grace = shutil.which("gracebat") or shutil.which("grace")
    if grace is None:
        return "missing_grace"
    return grace
