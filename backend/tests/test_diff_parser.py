from app.services.diff_parser import is_diff, parse_diff_to_hunks

def test_is_diff():
    not_a_diff = "def hello():\n    print('world')"
    a_diff = (
        "diff --git a/main.py b/main.py\n"
        "index 1234567..89abcde 100644\n"
        "--- a/main.py\n"
        "+++ b/main.py\n"
        "@@ -1,3 +1,4 @@\n"
        " def hello():\n"
        "-    print('world')\n"
        "+    print('hello world')\n"
        "+    print('success')"
    )
    assert is_diff(not_a_diff) is False
    assert is_diff(a_diff) is True

def test_parse_diff_to_hunks():
    a_diff = (
        "diff --git a/main.py b/main.py\n"
        "--- a/main.py\n"
        "+++ b/main.py\n"
        "@@ -1,3 +1,4 @@\n"
        " def hello():\n"
        "-    print('world')\n"
        "+    print('hello world')\n"
        "+    print('success')"
    )
    parsed = parse_diff_to_hunks(a_diff)
    assert len(parsed) == 1
    assert parsed[0]["filename"] == "main.py"
    assert len(parsed[0]["hunks"]) == 1
    
    hunk = parsed[0]["hunks"][0]
    assert len(hunk["lines"]) == 4
    
    # Check line types and line numbers mapping
    lines = hunk["lines"]
    assert lines[0]["type"] == "context"
    assert lines[0]["line_number"] == 1
    
    assert lines[1]["type"] == "deleted"
    assert lines[1]["line_number"] is None
    
    assert lines[2]["type"] == "added"
    assert lines[2]["line_number"] == 2
    
    assert lines[3]["type"] == "added"
    assert lines[3]["line_number"] == 3
