import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <DatabaseStatus />
    </>
  );
}

function DatabaseStatus() {
  const { data, isLoading, error } = useSWR("api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Falha ao carregar dados, tente novamente mais tarde.</p>;
  if (!data) return <p>Nenhum dado disponível.</p>;

  const db = data?.dependencies?.database ?? {};
  const updatedAt = new Date(data.updated_at).toLocaleString("pt-BR");
  return (
    <article>
      <section>
        <h2>Última atualização</h2>
        <p>{updatedAt}</p>
      </section>

      <section>
        <h2>Banco de Dados</h2>
        <ul>
          <li>
            <strong>Máx. conexões:</strong> {db.max_connections}
          </li>
          <li>
            <strong>Conexões abertas:</strong> {db.opened_connections}
          </li>
          <li>
            <strong>Versão:</strong> {db.version}
          </li>
        </ul>
      </section>
    </article>
  );
}
