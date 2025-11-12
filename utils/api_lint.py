import yaml

SCHEMA_ORDER = [
   "openapi",
    "info",
    "servers",
    "paths",
    "components",
    "security",
    "tags",
    "externalDocs",
]

def main():
    api = load_yaml("docs/api_design/api.yml")
    
    # スキーマの順序に従ってキーを並び替え
    ordered_api = {key: api[key] for key in SCHEMA_ORDER if key in api}
    
    # paths以下をアルファベット順にソート
    if "paths" in ordered_api:
        ordered_api["paths"] = dict(sorted(ordered_api["paths"].items(), key=lambda item: item[0]))
    
    # components以下のschemasをアルファベット順にソート
    if "components" in ordered_api and "schemas" in ordered_api["components"]:
        ordered_api["components"]["schemas"] = dict(
            sorted(ordered_api["components"]["schemas"].items(), key=lambda item: item[0])
        )
    
    # tagsを名前順にソート
    if "tags" in ordered_api:
        ordered_api["tags"] = sorted(ordered_api["tags"], key=lambda tag: tag.get("name", ""))
    
    # 保存
    save_yaml("docs/api_design/api.yml", ordered_api)

def load_yaml(file_path):
    with open(file_path, 'r') as file:
        return yaml.safe_load(file)

def save_yaml(file_path, data):
    with open(file_path, 'w') as file:
        yaml.dump(data, file, sort_keys=False, allow_unicode=True, indent=2)

if __name__ == "__main__":
    main()