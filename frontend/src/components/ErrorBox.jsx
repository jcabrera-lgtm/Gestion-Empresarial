export default function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="error" role="alert">
      <strong>{error.message ?? String(error)}</strong>
      {error.detalles?.length > 0 && (
        <ul>
          {error.detalles.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
