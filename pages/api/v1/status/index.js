async function status(request, response) {
  response.status(200).json({ chave: "São Paulo rebaixado em 1990" });
}

export default status;
