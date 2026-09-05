import React from 'react';

interface OllywoodLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'full' | 'compact' | 'emblem' | 'receipt';
  showSlogan?: boolean;
}

export const OllywoodLogo: React.FC<OllywoodLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSlogan = true,
}) => {
  // Compute pixel dimensions or responsive width
  let dimensionStyle: React.CSSProperties = {};
  let defaultClass = '';

  if (typeof size === 'number') {
    dimensionStyle = { width: size, height: 'auto' };
  } else {
    switch (size) {
      case 'sm':
        defaultClass = 'w-10 h-10';
        break;
      case 'md':
        defaultClass = 'w-24 h-24 sm:w-28 sm:h-28';
        break;
      case 'lg':
        defaultClass = 'w-36 h-36 sm:w-44 sm:h-44';
        break;
      case 'xl':
        defaultClass = 'w-56 h-56 sm:w-72 sm:h-72';
        break;
    }
  }

  // Pure SVG implementation - identical to authentic Ollywood Food Café brand mark
  return (
    <div
      className={`inline-flex items-center justify-center select-none ${defaultClass} ${className}`}
      style={dimensionStyle}
      title="Ollywood Food Café — The Taste That Everybody Loves To Taste"
    >
      <svg
        viewBox="0 0 580 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          <linearGradient id="ollywoodGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DEAA38" />
            <stop offset="50%" stopColor="#C6922C" />
            <stop offset="100%" stopColor="#B07C1C" />
          </linearGradient>
          <linearGradient id="ollywoodRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF3333" />
            <stop offset="100%" stopColor="#CE1717" />
          </linearGradient>
        </defs>

        {/* ================= TOP GREEN ACCENT STROKES ================= */}
        <path
          d="M 85 240 L 205 120 L 225 140"
          fill="none"
          stroke="#00A852"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 115 228 L 195 148"
          fill="none"
          stroke="#00A852"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* ================= TOP RED ROOF SHAPE ================= */}
        <path
          d="M 95 245 L 210 130 L 330 250 Z"
          fill="#E31E24"
        />

        {/* ================= DIAGONAL CUTLERY & ACCENTS ================= */}
        <g id="cutlery-group">
          {/* 1. Red Fork */}
          <line x1="210" y1="130" x2="295" y2="45" stroke="#E31E24" strokeWidth="9" strokeLinecap="round" />
          {/* Fork Head */}
          <path d="M 285 55 L 298 42 C 304 36 312 36 318 42 C 324 48 324 56 318 62 L 305 75 Z" fill="#E31E24" />
          <path d="M 282 32 L 310 60 M 289 25 L 317 53 M 296 18 L 324 46 M 303 11 L 331 39" stroke="#E31E24" strokeWidth="3.5" strokeLinecap="round" />

          {/* Green Dash 1 */}
          <line x1="240" y1="110" x2="260" y2="90" stroke="#00A852" strokeWidth="9" strokeLinecap="round" />

          {/* 2. Red Knife */}
          <line x1="245" y1="165" x2="330" y2="80" stroke="#E31E24" strokeWidth="9" strokeLinecap="round" />
          <path d="M 315 95 C 330 80 348 65 355 60 C 358 64 355 78 340 98 C 332 108 320 115 315 110 Z" fill="#E31E24" />

          {/* Green Dash 2 */}
          <line x1="280" y1="150" x2="305" y2="125" stroke="#00A852" strokeWidth="9" strokeLinecap="round" />

          {/* 3. Red Spoon */}
          <line x1="285" y1="205" x2="365" y2="125" stroke="#E31E24" strokeWidth="9" strokeLinecap="round" />
          <ellipse cx="380" cy="110" rx="20" ry="28" transform="rotate(45 380 110)" fill="#E31E24" />

          {/* Green Dash 3 */}
          <line x1="320" y1="190" x2="355" y2="155" stroke="#00A852" strokeWidth="9" strokeLinecap="round" />
        </g>

        {/* ================= CHEF HAT WITH 'OFC' SCRIPT ================= */}
        <g id="chef-hat-group" transform="translate(145, 142) scale(0.95)">
          {/* Hat billowy top */}
          <path
            d="M 20 55 
               C 10 40, 5 25, 20 15 
               C 30 5, 45 5, 55 15 
               C 65 0, 85 0, 95 15 
               C 105 5, 120 5, 130 15 
               C 145 25, 140 40, 130 55 Z"
            fill="#FFFFFF"
          />
          {/* Hat base band */}
          <path
            d="M 25 50 L 125 50 C 128 50, 130 52, 130 56 L 122 75 C 121 78, 118 80, 115 80 L 35 80 C 32 80, 29 78, 28 75 L 20 56 C 20 52, 22 50, 25 50 Z"
            fill="#FFFFFF"
          />
          {/* OFC green letters in cursive */}
          <text
            x="75"
            y="55"
            fontFamily="'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, sans-serif"
            fontSize="44"
            fontStyle="italic"
            fontWeight="bold"
            fill="#00A852"
            textAnchor="middle"
          >
            OFC
          </text>
        </g>

        {/* ================= BOTTOM GREEN V-SHIELD ================= */}
        <path
          d="M 125 365 L 210 450 L 310 350"
          fill="none"
          stroke="#00A852"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ================= NOODLE / HANDI BOWL WITH FLAME ================= */}
        <g id="bottom-bowl-group" transform="translate(190, 385)">
          <line x1="0" y1="12" x2="40" y2="-12" stroke="#B8860B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="12" x2="0" y2="-12" stroke="#B8860B" strokeWidth="2.5" strokeLinecap="round" />
          
          <path d="M 5 15 C 5 30 15 38 25 38 C 35 38 45 30 45 15 Z" fill="#C6922C" />
          <ellipse cx="25" cy="15" rx="20" ry="5" fill="#DEAA38" />

          <path d="M 10 14 Q 15 8 20 14 Q 25 8 30 14 Q 35 8 40 14" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          
          {/* Dual tone flame */}
          <path
            d="M 25 -10 
               C 27 -2, 33 2, 33 8 
               C 33 13, 29 16, 25 16 
               C 21 16, 17 13, 17 8 
               C 17 2, 23 -2, 25 -10 Z"
            fill="#FF4500"
          />
          <path
            d="M 25 -4 
               C 26 0, 29 3, 29 7 
               C 29 10, 27 12, 25 12 
               C 23 12, 21 10, 21 7 
               C 21 3, 24 0, 25 -4 Z"
            fill="#FFA500"
          />
        </g>

        {/* ================= OLLYWOOD WORDMARK ================= */}
        <g id="ollywood-logotype">
          {/* Tongue lick swash under O */}
          <path
            d="M 75 340 C 65 345 45 365 35 372 C 30 375 25 370 28 360 C 33 345 48 335 70 330 Z"
            fill="#E31E24"
          />

          {/* Letter O */}
          <ellipse cx="88" cy="295" rx="38" ry="46" fill="url(#ollywoodGold)" />
          <ellipse cx="88" cy="295" rx="20" ry="28" fill="#FFFFFF" />

          {/* Spatula, Fork & Flame inside O */}
          <g id="inner-o-bbq" transform="translate(88, 295)">
            <line x1="-16" y1="16" x2="16" y2="-16" stroke="#E31E24" strokeWidth="3" strokeLinecap="round" />
            <rect x="-19" y="11" width="6" height="8" transform="rotate(45 -16 15)" fill="#E31E24" />
            <line x1="-18" y1="13" x2="-14" y2="17" stroke="#FFFFFF" strokeWidth="0.8" />
            <line x1="-16" y1="11" x2="-12" y2="15" stroke="#FFFFFF" strokeWidth="0.8" />

            <line x1="16" y1="16" x2="-16" y2="-16" stroke="#E31E24" strokeWidth="3" strokeLinecap="round" />
            <path d="M 12 14 L 18 20 M 15 11 L 21 17 M 9 17 L 15 23" stroke="#E31E24" strokeWidth="1.5" strokeLinecap="round" />

            <path
              d="M 0 -18 
                 C 3 -10, 8 -6, 8 0 
                 C 8 5, 4 9, 0 9 
                 C -4 9, -8 5, -8 0 
                 C -8 -6, -3 -10, 0 -18 Z"
              fill="#FF4500"
            />
            <path
              d="M 0 -12 
                 C 2 -7, 5 -4, 5 0 
                 C 5 3, 3 6, 0 6 
                 C -3 6, -5 3, -5 0 
                 C -5 -4, -2 -7, 0 -12 Z"
              fill="#FFA500"
            />
          </g>

          {/* Letter 'l' #1 */}
          <path
            d="M 132 238 L 148 234 L 148 322 L 154 322 C 158 322 160 324 160 328 C 160 332 158 334 154 334 L 126 334 C 122 334 120 332 120 328 C 120 324 122 322 126 322 L 132 322 Z"
            fill="url(#ollywoodGold)"
          />

          {/* Letter 'l' #2 */}
          <path
            d="M 166 238 L 182 234 L 182 322 L 188 322 C 192 322 194 324 194 328 C 194 332 192 334 188 334 L 160 334 C 156 334 154 332 154 328 C 154 324 156 322 160 322 L 166 322 Z"
            fill="url(#ollywoodGold)"
          />

          {/* Letter 'y' with descending golden scoop */}
          <g id="letter-y-comp">
            <path
              d="M 194 270 L 214 316 L 216 316 L 236 270 L 250 270 L 222 332 C 215 348 206 364 192 372 C 185 376 178 377 172 377 L 170 366 C 176 366 182 364 188 358 C 196 350 202 338 206 326 L 182 270 Z"
              fill="url(#ollywoodGold)"
            />
            <circle cx="170" cy="372" r="7.5" fill="url(#ollywoodGold)" />
          </g>

          {/* Letter 'w' */}
          <path
            d="M 235 270 L 252 334 L 268 285 L 284 334 L 302 270 L 316 270 L 292 336 C 290 340 286 342 282 342 C 278 342 274 340 272 336 L 268 316 L 264 336 C 262 340 258 342 254 342 C 250 342 246 340 244 336 L 220 270 Z"
            fill="url(#ollywoodGold)"
          />

          {/* Double 'oo' as INFINITY SYMBOL */}
          <g id="double-oo-infinity-comp" transform="translate(365, 305)">
            <path
              d="M -36 -28 
                 C -20 -28, -8 -14, 0 0 
                 C 8 -14, 20 -28, 36 -28 
                 C 52 -28, 64 -14, 64 0 
                 C 64 14, 52 28, 36 28 
                 C 20 28, 8 14, 0 0 
                 C -8 14, -20 28, -36 28 
                 C -52 28, -64 14, -64 0 
                 C -64 -14, -52 -28, -36 -28 Z"
              fill="url(#ollywoodGold)"
            />
            <ellipse cx="-35" cy="0" rx="16" ry="17" fill="#FFFFFF" />
            <ellipse cx="35" cy="0" rx="16" ry="17" fill="#FFFFFF" />
          </g>

          {/* Letter 'd' */}
          <g id="letter-d-comp">
            <path
              d="M 452 238 L 468 234 L 468 322 L 474 322 C 478 322 480 324 480 328 C 480 332 478 334 474 334 L 446 334 C 442 334 440 332 440 328 C 440 324 442 322 446 322 L 452 322 Z"
              fill="url(#ollywoodGold)"
            />
            <ellipse cx="440" cy="302" rx="24" ry="26" fill="url(#ollywoodGold)" />
            <ellipse cx="442" cy="302" rx="12" ry="16" fill="#FFFFFF" />
          </g>
        </g>

        {/* ================= "Food Café" ================= */}
        <text
          x="250"
          y="260"
          fontFamily="'Futura', 'Trebuchet MS', 'Arial', sans-serif"
          fontSize="44"
          fontWeight="700"
          letterSpacing="2"
          fill="#E31E24"
        >
          Food Café
        </text>

        {/* ================= SLOGAN: "The Taste That Everybody Loves To Taste" ================= */}
        {showSlogan && (
          <text
            x="180"
            y="374"
            fontFamily="'Brush Script MT', 'Dancing Script', 'Snell Roundhand', cursive, serif"
            fontSize="28"
            fontStyle="italic"
            fontWeight="600"
            letterSpacing="0.5"
            fill="#E31E24"
          >
            The Taste That Everybody Loves To Taste
          </text>
        )}
      </svg>
    </div>
  );
};
