import React, { useState } from 'react';

const MarkingScheme = ({ onSubmit }) => {
  const [criteria, setCriteria] = useState([
    { description: '', points: 0 }
  ]);

  const addCriterion = () => {
    setCriteria([...criteria, { description: '', points: 0 }]);
  };

  const updateCriterion = (index, field, value) => {
    const newCriteria = [...criteria];
    newCriteria[index][field] = value;
    setCriteria(newCriteria);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(criteria);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Marking Scheme</h3>
      {criteria.map((criterion, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Criterion description"
            value={criterion.description}
            onChange={(e) => updateCriterion(index, 'description', e.target.value)}
          />
          <input
            type="number"
            placeholder="Points"
            value={criterion.points}
            onChange={(e) => updateCriterion(index, 'points', parseInt(e.target.value))}
          />
        </div>
      ))}
      <button type="button" onClick={addCriterion}>Add Criterion</button>
      <button type="submit">Save Marking Scheme</button>
    </form>
  );
};

export default MarkingScheme;
