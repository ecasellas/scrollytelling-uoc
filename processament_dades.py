from datetime import datetime

import json
import pandas as pd


# Carreguem les dades de tots els embassaments
with open("data/dades_embassaments.json", "rb") as f:
    data = json.load(f)

# Guardem les dades dels dos embassaments d'interès
out_susqueda = []
out_sau = []
for d in data:
    out = {}
    if d["estaci"] in ["Embassament de Susqueda (Osor)", "Embassament de Sau (Vilanova de Sau)"]:
        out["date"] = datetime.strptime(d["dia"], "%Y-%m-%dT00:00:00.000").strftime("%Y-%m-%d")
        out["percentatge"] = float(d["percentatge_volum_embassat"])
        if "Susqueda" in d["estaci"]:
            out_susqueda.append(out)
        else:
            out_sau.append(out)


# Ho posem en el format que ens interessa i ho guardem en un JSON
df_sus = pd.DataFrame(out_susqueda)
df_sau = pd.DataFrame(out_sau)

df_out = pd.merge(df_sus, df_sau, on="date")

dict_out = df_out.to_dict(orient="records")

with open("data/dades_conjuntes.json", "w") as f:
    json.dump(dict_out, f)
