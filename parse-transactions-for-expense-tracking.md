# Gathering transactions from all accounts

I went through each of my online banking accounts and downloaded the PDFs. I used [Tabula](https://tabula.technology) to extract all the tables into CSV. At this point I have a bunch of PDFs and CSVs in a folder, so I'll want to start combining all of this. (!) Be careful to exclude transaction from e.g. december that appear in this year's january statements. 

```python
# Lets get all my CSV files
import os
from glob import glob
PATH = "/Users/ab/Desktop/Transactions 2023"
EXT = "*.csv"
all_csv_files = [file
                 for path, subdir, files in os.walk(PATH)
                 for file in glob(os.path.join(path, EXT))]
print(all_csv_files)
```

```python
# Lets combine all the CSVs
# Dirty way, i.e. concat files
with open(PATH+"/combined.csv", 'w') as outfile:
    for fname in all_csv_files:
        with open(fname) as infile:
            outfile.write(infile.read())
print(PATH+"/combined.csv")
```

At this point I have a single CSV file I can open in a spreadsheet interface and do some rough cleaning up of any inconsistencies, mainly when some CSV have a different number of columns. When I'm done I download the cleaned up CSV file. 

I'll want to do some more automated clean up on it before loading it as a data set. In particular certain transactions are entered as multiple rows, so I want to combine those. 


```python
import csv 
with open(PATH+'/combined-clean.csv') as file_obj: 
    # Skip header
    # header = next(file_obj)  
    reader_obj = csv.reader(file_obj)
    rows = list(reader_obj)

    i=0
    while i < len(rows)-1:
        current_row = rows[i]
        next_row = rows[i+1]

        # some banks put the negative at the end of the number
        if len(current_row[4]) > 0 and current_row[4][-1] == '-':
            current_row[4] = '-' + current_row[4][:-1]

        # Excel doesn't like not having years on dates, and all mine are in 2023 at the time of writing
        if next_row[1]:
           next_row[1] += ", 2023"
        if next_row[2]:
           next_row[2] += ", 2023"
        
        # combine empty rows with the previous row
        if not next_row[2]:
            current_row[3] += " " + next_row[3]
            del rows[i+1]
        else:
            i += 1

# Print the updated rows
    for row in rows:
        print(row)
```

```python
# Now that my rows are clean, I can add them to pandas
# Create DataFrame
df = pd.DataFrame(rows[1:], columns=rows[0])

# Display DataFrame
print(df)
```

I'm ready to export that back into a spreadsheet. 


```python
# Export to Excel
df.to_excel(PATH+"/final.xlsx", index=False)
print(PATH+"/final.xlsx")
```

Next I want categorize the expenses, and the data is pretty clumsy. 

I would normally use [OpenRefine](https://openrefine.org) to cluster the data points and clean it up, but I just want to extract the category via the vendor name, so a simple look up might be more effective. 


```python
# I could shove every transaction through, but a lot of them get repeated, so I'll just parse the unique ones
uniqueDetails = df['Details'].unique()
len(df['Details'].unique()) # about 300 in my case
```

```python
# I want OpenAI to parse these into nice proper unique vendor names
# then I'll add a vendor info column to keep details like the USD amount in the original details

from dotenv import load_dotenv
load_dotenv()
openai_api_key = os.environ.get('OPENAI_API_KEY')

from openai import OpenAI
client = OpenAI()

import json

def AIReq(req_transactions):
    temp_vendors = pd.DataFrame()
    count_completed = 0
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        response_format= { "type": "json_object" },
        messages=[
        {"role": "system", "content": 'For the provided transaction details string, return a JSON object that contains a "transactions" parent object with child objects for each transaction. Each child object has a property named "original" and a property named "vendor". For each child object assign the property named "original" the original transaction details string, and to the property named "vendor" the vendor name corresponding to the transaction details. The resulting JSON object should be in this format: {"transactions":[{"original":"string","vendor":"string"}]}'},
        {"role": "user", "content": "\n".join(req_transactions) }
      ]
    )
    # yolo no error checking
    print("Processsing " + str(len(vendors_lookup)+len(req_transactions)) + " out of " + str(len(uniqueDetails)))
    print(completion.choices[0].message.content)
    # shove them into the list
    data = json.loads(completion.choices[0].message.content)
    for result in data['transactions']:
        new = pd.DataFrame(result,index=[0])
        temp_vendors = pd.concat([temp_vendors, new], ignore_index=True)
    return temp_vendors

vendors_lookup = pd.DataFrame()
batch_size = 10
for i in range(0, len(uniqueDetails), batch_size):
# for i in range(0, 20, batch_size):
    temp_vendors = AIReq(uniqueDetails[i:i+batch_size])
    # print(temp_vendors)
    vendors_lookup = pd.concat([vendors_lookup, temp_vendors], ignore_index=True)

vendors_lookup
```

```python
# Sweet, now I have all my vendors to do left join

df = pd.merge(df,  
                     vendors_lookup,  
                     left_on = 'Details',
                     right_on = 'original',
                     how = 'left') 
df 
```


```python
# Export to Excel again
def exportToExcel(tdf,filename):
    tdf.to_excel(PATH+filename, index=False)
    print(PATH+filename)

exportToExcel(df,"/with-vendors.xlsx")
```

    /Users/ab/Desktop/Transactions 2023/with-vendors.xlsx

