export function Wave() {
  return (
    <div className="wave-wrap">
      <div className="wave-inner">
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 1400 200"
          style={{ display: "block" }}
        >
          <path
            d="M0,40 Q70,10 140,40 T280,40 T420,40 T560,40 T700,40 T840,40 T980,40 T1120,40 T1260,40 T1400,40 L1400,200 L0,200 Z"
            fill="#0A1526"
            stroke="#4A7BAA"
            strokeWidth="3"
          />
        </svg>
      </div>
    </div>
  );
}
