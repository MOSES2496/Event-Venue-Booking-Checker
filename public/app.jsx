function App(){
  const [venues, setVenues] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [availability, setAvailability] = React.useState(null);
  const [query, setQuery] = React.useState({ venue: '', date: '' });

  React.useEffect(()=>{
    fetch('/api/venues')
      .then(r=>r.json())
      .then(d=>{
        if(d.success) setVenues(d.venues || []);
        else setError(d.message || 'Failed to load');
      })
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false));
  },[]);

  const checkAvailability = async (e)=>{
    e && e.preventDefault();
    setAvailability(null);
    try{
      const params = new URLSearchParams({ venue: query.venue, date: query.date });
      const res = await fetch(`/api/bookings/availability?${params.toString()}`);
      const json = await res.json();
      setAvailability(json);
    }catch(err){
      setAvailability({ success:false, message: err.message });
    }
  };

  return (
    <div>
      <h1>Venue Booking — Demo UI</h1>
      <section>
        <h2>Venues</h2>
        {loading? <p>Loading venues…</p> : error ? <p style={{color:'red'}}>{error}</p> : (
          <ul>{venues.map(v=> <li key={v._id}><strong>{v.name}</strong> — {v.location} — ${v.pricePerHour}/hr</li>)}</ul>
        )}
      </section>

      <section style={{marginTop:20}}>
        <h2>Check Availability</h2>
        <form onSubmit={checkAvailability}>
          <div>
            <label>Venue: </label>
            <select value={query.venue} onChange={e=>setQuery(q=>({...q, venue:e.target.value}))}>
              <option value="">-- select --</option>
              {venues.map(v=> <option key={v._id} value={v.name}>{v.name}</option>)}
            </select>
          </div>
          <div style={{marginTop:8}}>
            <label>Date: </label>
            <input type="date" value={query.date} onChange={e=>setQuery(q=>({...q, date:e.target.value}))} />
          </div>
          <div style={{marginTop:8}}>
            <button type="submit">Check</button>
          </div>
        </form>

        {availability && (
          <div style={{marginTop:12}}>
            {availability.success ? (
              <div>
                <p>Unavailable hours: {JSON.stringify(availability.unavailableHours)}</p>
                <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(availability.bookedSlots, null, 2)}</pre>
              </div>
            ) : (
              <p style={{color:'red'}}>{availability.message || 'No data'}</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
