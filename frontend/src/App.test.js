import { render, screen } from '@testing-library/react';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/index'; 

test('renders Online Shopping link', () => { 
  
  render(
    <Provider store={store}>
      <App /> 
    </Provider>
  );

  const linkElement = screen.getByText(/Online Shopping/i); 
  expect(linkElement).toBeInTheDocument();
});