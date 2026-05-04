// Add this ref at the top of the Projects component, with other useState calls:
const aiLoadingRef = React.useRef(false);

// Replace generateTasks with this:
const generateTasks = async () => {
  // Guard against duplicate calls (double-click protection)
  if (aiLoadingRef.current) return;
  if (!form.name.trim() || !form.description.trim()) {
    setAiError('Enter both project name and description first.');
    return;
  }
  aiLoadingRef.current = true;
  setAiError('');
  setAiLoading(true);
  setAiTasks([]); // Clear previous tasks before generating new ones

  try {
    const { data } = await axios.post('/ai/generate-tasks', {
      name: form.name.trim(),
      description: form.description.trim()
    });

    // ✅ FIX: Handle both string[] and object[] responses safely
    const normalized = (data.tasks || []).map((item, i) => ({
      id: Date.now() + i,
      text: typeof item === 'string'
        ? item
        : (item.title || item.task || item.name || item.text || JSON.stringify(item))
    })).filter(tk => tk.text.trim() !== '');

    setAiTasks(normalized);
  } catch (err) {
    setAiError(
      err.response?.data?.message || 'AI generation failed. Check your API key or try again.'
    );
  } finally {
    setAiLoading(false);
    aiLoadingRef.current = false;
  }
};