"use client";

import { motion } from "framer-motion";
import ReactCurvedText from "react-curved-text";

export function Header() {
  return (
    <header className="w-full flex justify-center items-center py-6">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 10 
        }}
        className="relative overflow-visible"
      >
        <div className="ticket-logo-container overflow-visible">
          <div className="relative overflow-visible">
            <ReactCurvedText
              width={450}
              height={145}
              cx={235}
              cy={250}
              rx={230}
              ry={170}
              startOffset={145}
              reversed={true}
              text="JACKPOT"
              textProps={{
                style: {
                  fontSize: "100px",
                  fontFamily: "Impact, Arial Black, sans-serif",
                  letterSpacing: "2px",
                  fontWeight: "bold",
                  fill: "#FFD700",
                  fillOpacity: 1,
                  stroke: "#D50000",
                  strokeWidth: 0,
                  textShadow: `
                    0 1px 0 #FFE866,
                    0 2px 0 #FFE866,
                    0 3px 0 #B39700,
                    0 4px 0 #B39700,
                    0 5px 0 #B39700,
                    0 6px 0 #B39700,
                    0 7px 0 #B39700,
                    0 8px 0 #B39700,
                    0 10px 15px rgba(0, 0, 0, 0.9)
                  `
                }
              }}
              textPathProps={{
                style: {
                  textOrientation: "upright"
                }
              }}
            />
          </div>
        </div>
      </motion.div>
    </header>
  );
}