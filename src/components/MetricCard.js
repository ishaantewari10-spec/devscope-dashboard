function MetricCard({ title, value }) {
return (
  <div>
    <h2>Debug Values</h2>
    {metrics.map((m) => (
      <p key={m.id}>
        {m.title}: {m.value}
      </p>
    ))}
  </div>
);

}

export default MetricCard;
