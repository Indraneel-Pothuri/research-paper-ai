"""
Research Paper AI - PDF ingestion pipeline

This script:
1. Reads every PDF from data/papers/
2. Extracts text page by page
3. Splits pages into overlapping chunks
4. Generates embeddings using Sentence Transformers
5. Saves the result to research_embeddings.json

This system is NOT tied to PPO.
Any research paper can be added to data/papers/.
"""

import json
import os
import re
from pathlib import Path

import fitz
from sentence_transformers import SentenceTransformer


# ============================================================
# CONFIGURATION
# ============================================================

PAPERS_DIR = Path(
    os.getenv("PAPERS_DIR", "data/papers")
)

OUTPUT_FILE = Path(
    os.getenv(
        "EMBEDDINGS_FILE",
        "data/processed/research_embeddings.json",
    )
)

EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL",
    "all-MiniLM-L6-v2",
)

CHUNK_SIZE = int(
    os.getenv("CHUNK_SIZE", "1200")
)

CHUNK_OVERLAP = int(
    os.getenv("CHUNK_OVERLAP", "200")
)


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(text: str) -> str:
    """
    Clean extracted PDF text without destroying mathematical
    or technical content.
    """

    text = text.replace("\x00", " ")

    # Remove excessive whitespace
    text = re.sub(r"[ \t]+", " ", text)

    # Keep paragraph structure
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


# ============================================================
# CHUNKING
# ============================================================

def chunk_text(text: str) -> list[str]:
    """
    Split text into overlapping chunks.

    Chunking is performed approximately by character count.
    """

    if not text:
        return []

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        end = min(
            start + CHUNK_SIZE,
            text_length,
        )

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - CHUNK_OVERLAP

        if start < 0:
            start = 0

    return chunks


# ============================================================
# PDF PROCESSING
# ============================================================

def process_pdf(
    pdf_path: Path,
    paper_id: str,
) -> list[dict]:

    print(f"\nProcessing: {pdf_path.name}")

    chunks = []

    document = fitz.open(pdf_path)

    print(f"Pages: {len(document)}")

    for page_index in range(len(document)):

        page = document[page_index]

        page_number = page_index + 1

        text = page.get_text("text")

        text = clean_text(text)

        if not text:
            print(
                f"  Page {page_number}: no extractable text"
            )
            continue

        page_chunks = chunk_text(text)

        print(
            f"  Page {page_number}: "
            f"{len(page_chunks)} chunks"
        )

        for chunk_index, chunk in enumerate(
            page_chunks
        ):

            chunk_id = (
                f"{paper_id}_"
                f"p{page_number}_"
                f"c{chunk_index + 1}"
            )

            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "paper_id": paper_id,
                    "paper_name": pdf_path.name,
                    "page": page_number,
                    "section": "",
                    "text": chunk,
                }
            )

    document.close()

    return chunks


# ============================================================
# PAPER ID
# ============================================================

def create_paper_id(pdf_path: Path) -> str:
    """
    Generate a clean identifier from the filename.
    """

    name = pdf_path.stem.lower()

    name = re.sub(
        r"[^a-z0-9]+",
        "_",
        name,
    )

    return name.strip("_")


# ============================================================
# MAIN INGESTION
# ============================================================

def main():

    print("=" * 72)
    print("RESEARCH PAPER AI - PDF INGESTION")
    print("=" * 72)

    PAPERS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    pdf_files = sorted(
        PAPERS_DIR.glob("*.pdf")
    )

    if not pdf_files:

        print("\nNo PDF files found.")

        print(
            f"\nPut your research papers inside:\n"
            f"{PAPERS_DIR}"
        )

        print(
            "\nExample:"
        )

        print(
            "data/papers/PPO.pdf"
        )

        return

    print(
        f"\nFound {len(pdf_files)} research paper(s)."
    )

    # ========================================================
    # EXTRACT TEXT
    # ========================================================

    all_chunks = []

    for pdf_path in pdf_files:

        paper_id = create_paper_id(
            pdf_path
        )

        try:

            paper_chunks = process_pdf(
                pdf_path,
                paper_id,
            )

            all_chunks.extend(
                paper_chunks
            )

        except Exception as exc:

            print(
                f"\nERROR processing "
                f"{pdf_path.name}: {exc}"
            )

    print("\n" + "=" * 72)
    print("TEXT EXTRACTION COMPLETE")
    print("=" * 72)

    print(
        f"\nTotal chunks created: "
        f"{len(all_chunks)}"
    )

    if not all_chunks:

        print(
            "\nNo text chunks were created."
        )

        print(
            "Check whether the PDFs contain "
            "selectable text."
        )

        return

    # ========================================================
    # EMBEDDINGS
    # ========================================================

    print(
        "\nLoading embedding model..."
    )

    model = SentenceTransformer(
        EMBEDDING_MODEL_NAME
    )

    print(
        "Embedding model loaded."
    )

    texts = [
        item["text"]
        for item in all_chunks
    ]

    print(
        f"\nGenerating embeddings for "
        f"{len(texts)} chunks..."
    )

    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True,
        normalize_embeddings=True,
    )

    # ========================================================
    # SAVE
    # ========================================================

    for item, embedding in zip(
        all_chunks,
        embeddings,
    ):

        item["embedding"] = (
            embedding.tolist()
        )

    print(
        "\nSaving embeddings..."
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            all_chunks,
            file,
            ensure_ascii=False,
        )

    print(
        f"\nSaved to:\n{OUTPUT_FILE}"
    )

    print("\n" + "=" * 72)
    print("INGESTION COMPLETE")
    print("=" * 72)

    print(
        f"\nPapers processed: "
        f"{len(pdf_files)}"
    )

    print(
        f"Total chunks: "
        f"{len(all_chunks)}"
    )

    print(
        "\nYour Research Paper AI is now ready "
        "to search these papers."
    )


if __name__ == "__main__":
    main()