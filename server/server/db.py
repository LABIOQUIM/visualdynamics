from pony.orm import Database, PrimaryKey, Required, Optional
from uuid import UUID
from datetime import datetime
import os


db = Database()

db.bind(
    provider='postgres',
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASS"),
    host=os.environ.get("DB_HOST"),
    database=os.environ.get("DB_DATABASE")
)


class Simulation(db.Entity):
    _table_ = "simulations"
    id = PrimaryKey(str)
    user_id = Required(str)
    molecule_name = Required(str)
    type = Required(str)
    created_at = Required(datetime)
    started_at = Optional(datetime)
    ended_at = Optional(datetime)
    status = Required(str)
    errored_on_command = Optional(str)


class User(db.Entity):
    _table_ = "users"
    id = PrimaryKey(str)
    username = Required(str)
    email = Required(str)


db.generate_mapping()
