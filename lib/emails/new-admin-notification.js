const {template} = require('lodash')
const {getEditorUrl, getApiUrl} = require('./util')

const bodyTemplate = template(`
<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Invitation à l‘administration d‘une Base Adresse Locale</title>
  <style>
    body {
      background-color: #F5F6F7;
      color: #234361;
      font-family: "SF UI Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      margin: auto;
      padding: 25px;
    }

    a {
      color: white;
      text-decoration: none;
    }

    button {
      background-color: #0053b3;
      border: none;
      border-radius: 3px;
      padding: 10px;
    }

    h2 {
      font-weight: lighter;
      margin: 16px;
    }

    img {
      background-color: white;
      height: 65px;
      padding-right: 5px;
    }

    .bal {
      font-size: 25px;
      font-weight: bold;
    }

    .banner {
      background-color: #0053b3;
      border-radius: 2px;
      color: white;
      display: flex;
      justify-content: space-between;
    }

    .banTitle {
      font-size: 25px;
      font-weight: lighter;
      margin: 16px;
    }

    .container {
      background-color: #ebeff3;
      padding: 25px;
    }

    .infos {
      margin-top: 35px;
    }

    .title {
      align-items: center;
      border-bottom: 1px solid #E4E7EB;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 15em;
      padding: 10px;
      text-align: center;
    }

  </style>
</head>

<body>
  <div class="banner">
    <img src="<%= apiUrl %>/public/images/logo-marianne.svg" alt="Logo République Française">
    <span class="banTitle">adresse.data.gouv.fr</span>
  </div>
  <div class="title">
    <h3>Vous êtes invité à participer à l'édition de la Base Adresse Locale:</h3>
    <span class="bal"><%= baseLocale.nom || 'non renseigné' %></span>
  </div>

  <div class="container">
    
    <p>Vous pouvez dès maintenant particper à l'administration de votre <b>Base Adresse Locale</b> à partir de la page
      suivante&nbsp;: </p>
    <button><a href="<%= editorUrl %>" target="blank">Gérer mes adresses</a></button>
      
    <p>En cas de problème, l'accès à la <b><i>Base Adresse Locale</i></b> peut être réinitialisé sur demande.</p>
      
    <p><i>L’équipe adresse.data.gouv.fr</i></p>
    <p class="infos"><small><i>Nouveau jeton (information expert)&nbsp;: <%= baseLocale.token %></i></small></p>
  </div>
</body>

</html>
`)

function formatEmail(data) {
  const {baseLocale} = data
  const editorUrl = getEditorUrl(baseLocale)
  const apiUrl = getApiUrl()

  return {
    subject: 'Invitation à l‘administration d‘une Base Adresse Locale',
    html: bodyTemplate({baseLocale, editorUrl, apiUrl})
  }
}

module.exports = formatEmail