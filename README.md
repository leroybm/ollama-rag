# PrivateGPT with phind-codellama

> Note: this example is a slightly modified version of [this example from ollama source code](https://github.com/jmorganca/ollama/tree/main/examples/langchain-python-rag-privategpt)

### Setup

Set up a virtual environment (optional):

```
python3 -m venv .venv
source .venv/bin/activate
```

Install the Python dependencies:

```shell
pip install -r requirements.txt
```

Pull the model you'd like to use:

```shell
ollama pull phind-codellama
```

### Get the data that you want to use as source for your embeddings

```shell
mkdir source_documents
rsync -av --delete --exclude '.*' --exclude 'node_modules/' ../YOUR_PROJECT source_documents
```

### Ingesting files

```shell
python ingest.py
```

Output should look like this:

```shell
Creating new vectorstore
Loading documents from source_documents
Loading new documents: 100%|████████████████████| 86/86 [00:01<00:00, 49.19it/s]
Loaded 86 new documents from source_documents
Split into 400 chunks of text (max. 500 tokens each)
Creating embeddings. May take some minutes...
Ingestion complete! You can now run privateGPT.py to query your documents
```

### Ask questions

```shell
python privateGPT.py

Enter a query: Refactor ExternalDocumentationLink to accept an icon property and display it after the anchor text, replacing the icon that is already there

> Answer:
You can refactor the `ExternalDocumentationLink` component by modifying its props and JSX. First, update the prop types to include a new `icon` prop which will accept a ReactNode. Then, place the `{icon}` after the anchor text inside the component's JSX. Here's an example of how you could refactor this component:

```jsx
import React from 'react';

interface ExternalDocumentationLinkProps {
  className?: string;
  href: string;
  label?: string;
  icon?: React.ReactNode; // add this line
}

...
```

## Limitations

- Currently `.ts` and `.tsx` are being loaded with `TextLoader` as I coulnd't find any specific loader for Typescript files
