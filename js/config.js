/* Citlali · configuración del sitio
   formEndpoint : URL de Formspree (o similar) cuando la escuela tenga el servicio. Ejemplo: "https://formspree.io/f/xxxxxxx"
                  Mientras esté vacío, los formularios abren el correo del visitante con el mensaje ya redactado.
   mailTo       : correo de la escuela que recibe las solicitudes.
   hideMarkers  : true = oculta los marcadores [entre corchetes] (para la publicación final).
   boutique     : true = la Tienda (menú y página) está visible; false = se oculta del menú, del pie y la página redirige al inicio.
   eventsOff    : lista de eventos que se ocultan YA, sin esperar la fecha. Ejemplo: ["halloween"]
   eventUntil   : cambia la fecha límite (inclusive, formato AAAA-MM-DD) de un evento. Ejemplo: { halloween: "2026-10-31" }
   portesOuvertes : false = el aviso de Puertas abiertas NO aparece. true = aparece en el inicio (usa las fechas de portesDates).
   portesDates  : fechas que se muestran en el aviso, en cada idioma. Ejemplo:
                  { fr: "Samedi 14 mars, de 10 h à 13 h", en: "Saturday 14 March, 10 am to 1 pm", es: "Sábado 14 de marzo, de 10:00 a 13:00" }
   portesHasta  : (opcional) "AAAA-MM-DD": el aviso se oculta solo después de esa fecha.
   eventsOn     : (avanzado) eventos que están APAGADOS por defecto y se encienden aquí. Para mostrar el aviso de Puertas abiertas: ["portes"]
   eventDates   : fechas que se muestran en el aviso, en cada idioma. Ejemplo:
                  { portes: { fr: "Samedi 14 mars, de 10 h à 13 h", en: "Saturday 14 March, 10 am to 1 pm", es: "Sábado 14 de marzo, de 10:00 a 13:00" } }
                  Los eventos se ocultan solos al pasar su fecha límite (Halloween: 2026-10-30). */
window.CITLALI_CONFIG = {
  formEndpoint: "",
  mailTo: "citlaliinternationalschool@gmail.com",
  boutique: true,
  hideMarkers: false,
  eventsOff: [],
  eventUntil: {},
  portesOuvertes: false,
  portesDates: { fr: "", en: "", es: "" },
  portesHasta: "",
  eventsOn: [],
  eventDates: {}
};

(function (c) {
  if (c.portesOuvertes === true) {
    c.eventsOn = (c.eventsOn || []).concat('portes');
    c.eventDates = c.eventDates || {}; c.eventDates.portes = c.portesDates || {};
    if (c.portesHasta) { c.eventUntil = c.eventUntil || {}; c.eventUntil.portes = c.portesHasta; }
  }
})(window.CITLALI_CONFIG);
if (window.CITLALI_CONFIG.boutique === false) document.documentElement.classList.add('no-boutique');
