import "./Modal.css";

export default function TransactionModal({ isOpen, onClose, onSubmit, onDelete, formData, setFormData, categories }) {
  if (!isOpen) return null;

  // Проверяем, редактируем ли мы запись или создаем новую
  const isEditing = !!formData.transaction_id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Динамический заголовок */}
        <h2 className="modal-title">{isEditing ? "Edit Entry" : "New Entry"}</h2>
        
        <form className="modal-form" onSubmit={onSubmit}>
          
          <div className="input-group">
            <label>Info</label>
            <input 
              className="modal-input"
              type="text" 
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>Sum</label>
            <input 
              className="modal-input"
              type="number" 
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>Cat</label>
            <select 
              className="modal-select"
              required
              value={String(formData.category)}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={String(cat.category_id)}>
                  {cat.category_name} 
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Type</label>
            <select 
              className="modal-select"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="input-group">
            <label>When</label>
            <input 
              className="modal-input"
              type="datetime-local" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          {/* Секция кнопок с логикой переключения */}
          <div className="modal-actions">
            {isEditing ? (
              <>
                <button 
                  type="button" 
                  className="delete-btn-modal" 
                  onClick={() => onDelete(formData.transaction_id)}
                >
                  Delete
                </button>
                <button type="submit" className="confirm-btn">Confirm</button>
              </>
            ) : (
              <>
                <button type="submit" className="confirm-btn">Confirm</button>
                <button type="button" className="cancel-btn" onClick={onClose}>Close</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}