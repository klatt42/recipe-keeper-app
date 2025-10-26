-- Add category column to recipes table
ALTER TABLE recipes
ADD COLUMN category TEXT;

-- Create an index on category for better query performance
CREATE INDEX idx_recipes_category ON recipes(category);

-- Add a check constraint for valid categories (optional, for data integrity)
ALTER TABLE recipes
ADD CONSTRAINT valid_category CHECK (
  category IS NULL OR
  category IN (
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Appetizer',
    'Snack',
    'Beverage',
    'Salad',
    'Soup',
    'Side Dish',
    'Main Course',
    'Baking',
    'Other'
  )
);
