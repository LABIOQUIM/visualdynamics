from app.utils.send_email import send_dynamic_success_email
from . import MiscBlueprint
from flask import render_template, make_response, request, redirect
from flask_babel import _

# INFO Alterar Idioma
# Altera o cookie preferred-lang (apenas 'en' e 'pt' possuem suporte)
@MiscBlueprint.route("/set-lang/<lang>")
def setPreferredLang(lang):
    resp = make_response()
    resp.set_cookie("preferred-lang", value=lang)

    # redireciona pra página que usuário estava quando clicou em alguma das bandeiras
    resp.headers["location"] = request.referrer

    return resp, 302


# INFO Sobre
@MiscBlueprint.route("/about", methods=["GET"], endpoint="about")
def about():
    return render_template("about.html", actabout="active", title=_("Sobre"))
