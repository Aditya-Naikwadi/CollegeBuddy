"""Unit tests for Hybrid Retriever functionality."""

import pytest
import os
import pandas as pd
from app.retriever import FAQRetriever


@pytest.fixture(scope="module")
def initialized_retriever():
    """Fixture providing an initialized FAQRetriever instance."""
    retriever = FAQRetriever()
    retriever.initialize()
    return retriever


def test_retriever_initialization(initialized_retriever):
    """Verify that dataframe and vocabulary are correctly loaded."""
    assert initialized_retriever.is_ready is True
    assert len(initialized_retriever.df) >= 20
    assert initialized_retriever.tfidf_matrix is not None
    assert initialized_retriever.tfidf_matrix.shape[0] == len(initialized_retriever.df)


def test_retriever_categories(initialized_retriever):
    """Verify categories extracted from sample FAQs."""
    categories = initialized_retriever.get_categories()
    assert "Admissions" in categories
    assert "Fees" in categories
    assert "Hostel" in categories
    assert "Exams" in categories
    assert "Placements" in categories


def test_retrieval_exact_and_semantic_query(initialized_retriever):
    """Verify high retrieval match for tuition fee inquiry."""
    result = initialized_retriever.retrieve("What is the tuition fee for BTech?")
    assert result["top_match"] is not None
    assert result["is_confident"] is True
    # The top match should be either FAQ 4 (B.Tech tuition fee) or related fee FAQ
    assert result["top_match"]["category"] == "Fees"
    assert result["top_score"] >= 0.35


def test_category_filtering(initialized_retriever):
    """Verify that category filtering restricts matches to the chosen domain."""
    result = initialized_retriever.retrieve(
        query="What are the rules and timings?",
        category="Hostel"
    )
    assert result["top_match"] is not None
    assert result["top_match"]["category"] == "Hostel"


def test_out_of_scope_query_low_confidence(initialized_retriever):
    """Verify out-of-scope query yields low confidence below threshold."""
    result = initialized_retriever.retrieve("How do I make chocolate chip cookies on Mars?")
    # Out of scope queries should have low hybrid score
    assert result["top_score"] < 0.35
    assert result["is_confident"] is False
