import pandas as pd
import json

df = pd.read_json('sisul.json')
df.to_excel("sisul.xlsx",index=False)