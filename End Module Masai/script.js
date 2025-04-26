const { useState, useEffect } = React;

const FIREBASE_URL = "https://masai-feedback-form-default-rtdb.asia-southeast1.firebasedatabase.app/";

function App() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch(`${FIREBASE_URL}.json`)
      .then(res => res.json())
      .then(data => {
        const loaded = Object.entries(data || {}).map(([id, item]) => ({ id, ...item }));
        setFeedbacks(loaded.reverse());
      });
  }, []);

  const addFeedback = async (fb) => {
    const res = await fetch(`${FIREBASE_URL}.json`, {
      method: "POST",
      body: JSON.stringify({ ...fb, timestamp: new Date().toISOString() }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    setFeedbacks([{ id: data.name, ...fb }, ...feedbacks]);
  };

  const deleteFeedback = async (id) => {
    await fetch(`${FIREBASE_URL}/${id}.json`, { method: "DELETE" });
    setFeedbacks(feedbacks.filter(f => f.id !== id));
  };

  return (
    <div className="container">
      <Header onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")} />
      <FeedbackForm onSubmit={addFeedback} />
      <FeedbackList feedbacks={feedbacks} onDelete={deleteFeedback} />
    </div>
  );
}

function Header({ onToggleTheme }) {
  return (
    <header className="header">
      <h1>Feedback Board</h1>
      <button onClick={onToggleTheme}>Toggle Theme</button>
    </header>
  );
}

function FeedbackForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", email: "", comment: "" });
  const [message, setMessage] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => form.name && /^\S+@\S+\.\S+$/.test(form.email) && form.comment;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage("Please fill all fields correctly.");
      return;
    }
    onSubmit(form);
    setForm({ name: "", email: "", comment: "" });
    setMessage("Feedback submitted!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <textarea name="comment" placeholder="Your Feedback" value={form.comment} onChange={handleChange} required />
      <button type="submit">Submit</button>
      <p className="message">{message}</p>
    </form>
  );
}

function FeedbackList({ feedbacks, onDelete }) {
  return (
    <div className="feedback-list">
      {feedbacks.map(fb => (
        <FeedbackItem key={fb.id} feedback={fb} onDelete={() => onDelete(fb.id)} />
      ))}
    </div>
  );
}

function FeedbackItem({ feedback, onDelete }) {
  return (
    <div className="feedback-card">
      <h3>{feedback.name}</h3>
      <p>{feedback.comment}</p>
      <span>{feedback.email}</span>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
