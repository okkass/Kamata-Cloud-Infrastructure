import uuid
from schemathesis import hooks

FIXED = "57de4a97-8377-4f7c-9ba9-414080ad184d"


def normalize(obj):
    if isinstance(obj, dict):
        return {k: normalize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [normalize(v) for v in obj]
    if isinstance(obj, str):
        try:
            uuid.UUID(obj)
            return str(FIXED)
        except ValueError:
            return obj
    return obj


@hooks.register("before_generate_case")
def fix_uuids(context, case):
    case.body = normalize(case.body)
    case.path_parameters = normalize(case.path_parameters)
    case.query = normalize(case.query)
