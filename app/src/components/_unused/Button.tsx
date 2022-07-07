// import React from 'react';
// import './Button.css';
// import { Link } from 'react-router-dom';

// export function Button() {
//   return (
//     <Link to='sign-up'>
//       <button className='btn'>Sign Up</button>
//     </Link>
//   );
// }

import React from 'react';
import './Button.css'

const STYLES = ['btn--primary', 'btn--outline', 'btn--test'];
const SIZES = ['btn--medium', 'btn--large'];


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonStyle?: string,
  buttonSize?: string
}

export const Button: React.FC<ButtonProps> = ({ buttonStyle, buttonSize, ...props }) => {
  const checkButtonStyle = STYLES.includes(buttonStyle!)
    ? buttonStyle
    : STYLES[0];

  const checkButtonSize = SIZES.includes(buttonSize!) ? buttonSize : SIZES[0];

  return (
      <button
        className={`btn ${checkButtonStyle} ${checkButtonSize}`}
        onClick={props['onClick']}
        type={props['type']}
      >
        {props['children']}
      </button>
  );
};
