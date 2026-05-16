const StaffChat = require('../models/StaffChat');

// Get chat history for the logged-in staff member
const getChatHistory = async (req, res) => {
  try {
    const chat = await StaffChat.findOne({ user: req.user._id });
    res.json(chat ? chat.messages : []);
  } catch (error) {
    console.error('Error fetching staff chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
};

// Save a new message (either user or assistant)
const saveMessage = async (req, res) => {
  try {
    const { role, content } = req.body;
    
    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required.' });
    }

    let chat = await StaffChat.findOne({ user: req.user._id });
    if (!chat) {
      chat = new StaffChat({ user: req.user._id, messages: [] });
    }

    chat.messages.push({ role, content });
    await chat.save();

    res.json({ success: true, message: 'Message saved successfully.' });
  } catch (error) {
    console.error('Error saving staff message:', error);
    res.status(500).json({ error: 'Failed to save message.' });
  }
};

// Clear entire chat history
const deleteChat = async (req, res) => {
  try {
    const result = await StaffChat.findOneAndDelete({ user: req.user._id });
    if (!result) return res.status(404).json({ error: 'No chat history found to delete.' });
    res.json({ message: 'Chat history cleared successfully.' });
  } catch (error) {
    console.error('Error deleting staff chat:', error);
    res.status(500).json({ error: 'Failed to delete chat history.' });
  }
};

module.exports = { getChatHistory, saveMessage, deleteChat };
