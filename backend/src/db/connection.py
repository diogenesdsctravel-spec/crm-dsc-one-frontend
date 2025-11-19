import os
import psycopg2
from psycopg2 import OperationalError
from dotenv import load_dotenv

# Carregar o .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """
    Abre conexão com o Postgres usando a DATABASE_URL.
    Se der erro, imprime e retorna None.
    """
    try:
        if not DATABASE_URL:
            print("[DB] ERRO: DATABASE_URL não definida no .env")
            return None

        conn = psycopg2.connect(DATABASE_URL)
        return conn

    except OperationalError as e:
        print("[DB] ERRO AO CONECTAR AO POSTGRES:")
        print(str(e))
        return None

