Run tests
pytest --cov=app --cov-report=html

Run specific test
pytest tests/test_spool_endpoints.py::test_create_spool_success -s

Start the app
uvicorn app.main:app --reload
