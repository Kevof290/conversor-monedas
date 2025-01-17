const conversion = document.getElementById("conversion");
const mensajeError = document.getElementById("error");
const grafico = document.getElementById("grafico");
const btn = document.getElementById("btn");
let graficoHistorial;
const apiURL = "https://mindicador.cl/api";

//FORMATO CLP PARA EL INPUT
const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
});

//ESCUCHA AL INPUT Y FORMATEA EL VALOR A CLP
document.getElementById("input").addEventListener("input", (event) => {
  const rawValue = event.target.value.replace(/\D/g, "");
  event.target.value = rawValue ? formatoCLP.format(rawValue) : "";
});

//BOTON DE CONVERSIÓN DE MONEDAS
btn.addEventListener("click", async () => {
  const rawInput = document.getElementById("input").value.replace(/\D/g, "");
  const select = document.getElementById("monedas").value;

  if (!rawInput || rawInput <= 0) {
    mensajeError.innerHTML = "Error: Debes ingresar un valor mayor a 0";
    return;
  }
  try {
    const res = await fetch(apiURL);
    if (!res.ok) {
      throw new Error("No se pudo obtener los datos de la API");
    }

    const data = await res.json();
    const tasaConversion = data[select].valor;
    const valorFinal = (rawInput / tasaConversion).toFixed(2);
    const inputFormatoClp = formatoCLP.format(rawInput);
    conversion.innerHTML = `${inputFormatoClp} pesos chilenos son ${valorFinal} ${data[select].nombre}`;

    graficoRender(data[select]);
  } catch (error) {
    mensajeError.innerHTML = `Error: ${error.message}`;
  }
});

//RENDERIZA EL GRAFICO CON EL HISTORIAL DE LAS MONEDAS
async function graficoRender(infoMonedas) {
  const historial = `${apiURL}/${infoMonedas.codigo}`;
  try {
    const response = await fetch(historial);
    if (!response.ok) {
      throw new Error("No se pudo obtener el historial de la moneda.");
    }

    const data = await response.json();
    const labels = data.serie
      .slice(0, 10)
      .map((entry) => entry.fecha.split("T")[0]);
    const values = data.serie.slice(0, 10).map((entry) => entry.valor);

    if (graficoHistorial) {
      graficoHistorial.destroy();
    }

    graficoHistorial = new Chart(grafico, {
      type: "line",
      data: {
        labels: labels.reverse(),
        datasets: [{
            label: `Historial últimos 10 días (${infoMonedas.nombre})`,
            data: values.reverse(),
            borderColor: "#EFB6C8",
            borderWidth: 3,
            fill: false,
          }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    });
  } catch (error) {
    mensajeError.innerHTML = `Error al cargar el gráfico: ${error.message}`;
  }
}
