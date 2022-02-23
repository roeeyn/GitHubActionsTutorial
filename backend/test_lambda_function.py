from lambda_function import create_message
import pytest


@pytest.mark.parametrize(
    "name,message",
    [
        ("John", "Hola soy John!"),
        ("Jane", "Hola soy Jane!"),
        ("Mary", "Hola soy Mary!"),
        ("Mike", "Hola soy Mike!"),
        ("Paul", "Hola soy Paul!"),
        ("Peter", "Hola soy Peter!"),
        ("Sam", "Hola soy Sam!"),
        ("Tom", "Hola soy Tom!"),
        ("Will", "Hola soy Will!"),
        ("Xavier", "Hola soy Xavier!"),
        ("Yvonne", "Hola soy Yvonne!"),
        ("Zachary", "Hola soy Zachary!"),
        ("Zoe", "Hola soy Zoe!"),
    ],
)
def test_create_message(name, message):
    assert create_message(name) == message
