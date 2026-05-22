import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SeatSelectorProps {
  selectedSeatIds: Set<string>;
  bookedSeatIds: Set<string>;
  onToggleSeat: (seatId: string) => void;
  maxSelectable: number;
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 12;
const AISLE_AFTER = 6; // Aisle after 6th seat (middle)

export default function SeatSelector({
  selectedSeatIds,
  bookedSeatIds,
  onToggleSeat,
  maxSelectable,
}: SeatSelectorProps) {
  const handleSeatClick = useCallback(
    (seatId: string) => {
      if (bookedSeatIds.has(seatId)) return;

      if (selectedSeatIds.has(seatId)) {
        onToggleSeat(seatId);
        return;
      }

      if (selectedSeatIds.size >= maxSelectable) return;

      onToggleSeat(seatId);
    },
    [bookedSeatIds, selectedSeatIds, onToggleSeat, maxSelectable]
  );

  const getSeatStatus = (seatId: string) => {
    if (bookedSeatIds.has(seatId)) return 'taken';
    if (selectedSeatIds.has(seatId)) return 'selected';
    return 'available';
  };

  const isPremium = (row: string) => row === 'A' || row === 'B';

  const totalSeats = ROWS.length * SEATS_PER_ROW;
  const bookedCount = bookedSeatIds.size;
  const availableCount = totalSeats - bookedCount;

  return (
    <div className="space-y-6">
      {/* Screen Display */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-4/5 h-1.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent rounded-full" />
        <div className="w-3/5 h-8 bg-gradient-to-b from-accent/8 to-transparent rounded-b-[50%] -mt-px" />
        <span className="text-[10px] text-text-muted uppercase tracking-[0.3em] -mt-1 font-semibold">
          Screen
        </span>
      </div>

      {/* Seat Stats */}
      <div className="flex justify-center gap-6 px-4 py-2 bg-bg-surface/30 rounded-lg border border-border/50">
        <div className="text-center">
          <div className="text-sm font-semibold text-text-primary">{availableCount}</div>
          <div className="text-xs text-text-muted">Available</div>
        </div>
        <div className="w-px bg-border/50" />
        <div className="text-center">
          <div className="text-sm font-semibold text-accent">{selectedSeatIds.size}</div>
          <div className="text-xs text-text-muted">Selected</div>
        </div>
        <div className="w-px bg-border/50" />
        <div className="text-center">
          <div className="text-sm font-semibold text-text-muted/60">{bookedCount}</div>
          <div className="text-xs text-text-muted">Booked</div>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="flex flex-col items-center gap-[6px] overflow-x-auto pb-4">
        {ROWS.map((row, rowIndex) => (
          <motion.div
            key={row}
            className="flex items-center gap-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
          >
            {/* Row Label - Left */}
            <span className="w-6 text-[11px] text-text-muted/60 text-right mr-2 font-mono select-none font-semibold">
              {row}
            </span>

            {/* Seats */}
            <div className="flex items-center gap-[5px]">
              {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                const seatNum = i + 1;
                const seatId = `${row}${seatNum}`;
                const status = getSeatStatus(seatId);
                const premium = isPremium(row);
                const hasGapAfter = seatNum === AISLE_AFTER;

                return (
                  <div
                    key={seatId}
                    className={`flex items-center ${hasGapAfter ? 'mr-2' : ''}`}
                  >
                    <motion.button
                      type="button"
                      onClick={() => handleSeatClick(seatId)}
                      disabled={status === 'taken'}
                      whileTap={status !== 'taken' ? { scale: 0.85 } : undefined}
                      whileHover={
                        status !== 'taken'
                          ? { y: -2 }
                          : undefined
                      }
                      className={`
                        relative w-7 h-7 sm:w-8 sm:h-8 rounded-t-[6px] text-[9px] sm:text-[10px] font-bold
                        flex items-center justify-center transition-all duration-150
                        ${
                          status === 'taken'
                            ? 'bg-bg-dark/40 text-text-muted/20 cursor-not-allowed border border-text-muted/10 shadow-inner'
                            : status === 'selected'
                            ? `bg-accent text-white shadow-lg shadow-accent-glow/50 cursor-pointer border border-accent/50 ${
                                premium ? 'ring-1 ring-gold/40' : ''
                              }`
                            : `cursor-pointer border transition-colors ${
                                premium
                                  ? 'bg-bg-surface border-gold/30 text-gold/70 hover:border-gold/60 hover:bg-gold/15 hover:text-gold hover:shadow-sm hover:shadow-gold/20'
                                  : 'bg-bg-surface border-border text-text-muted/70 hover:border-accent/60 hover:bg-accent/8 hover:text-text-primary hover:shadow-sm hover:shadow-accent/10'
                              }
                              ${
                                selectedSeatIds.size >= maxSelectable &&
                                status === 'available'
                                  ? 'opacity-40 cursor-not-allowed'
                                  : ''
                              }
                            `
                        }
                      `}
                      aria-label={`Seat ${seatId} - ${status}`}
                      title={
                        status === 'taken'
                          ? 'Booked'
                          : status === 'selected'
                          ? 'Click to deselect'
                          : premium
                          ? `Premium - ${seatId}`
                          : seatId
                      }
                    >
                      {seatNum}

                      {/* Ripple animation on selection */}
                      <AnimatePresence>
                        {status === 'selected' && (
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0.8 }}
                            animate={{ scale: 1.6, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 rounded-t-[6px] bg-accent pointer-events-none"
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                );
              })}
            </div>

            {/* Row Label - Right */}
            <span className="w-6 text-[11px] text-text-muted/60 text-left ml-2 font-mono select-none font-semibold">
              {row}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/50">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-5 h-5 rounded-t-md bg-bg-surface border border-border" />
          <span className="text-xs text-text-muted">Available</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="w-5 h-5 rounded-t-md bg-accent shadow-sm shadow-accent-glow" />
          <span className="text-xs text-text-muted">Selected</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-5 h-5 rounded-t-md bg-bg-dark/40 border border-text-muted/10" />
          <span className="text-xs text-text-muted">Booked</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="w-5 h-5 rounded-t-md bg-bg-surface border border-gold/30" />
          <span className="text-xs text-gold/70">Premium</span>
        </motion.div>
      </div>

      {/* Selected Seats Display */}
      <AnimatePresence>
        {selectedSeatIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            className="bg-bg-surface/50 border border-border/70 rounded-xl p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-0.5">
                  Your seats ({selectedSeatIds.size})
                </span>
                <span className="text-xs text-text-muted/60">
                  Tap a seat to remove it
                </span>
              </div>
              <span className="text-xs text-text-muted/70 bg-bg-card px-2.5 py-1 rounded-full border border-border/50">
                {selectedSeatIds.size} / {maxSelectable}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {Array.from(selectedSeatIds)
                  .sort()
                  .map((seatId) => (
                    <motion.button
                      key={seatId}
                      type="button"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      layoutId={seatId}
                      onClick={() => onToggleSeat(seatId)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 bg-accent/15 border border-accent/40 rounded-lg text-accent text-xs font-semibold hover:bg-accent/25 hover:border-accent/60 transition-all cursor-pointer"
                    >
                      <span className="font-mono">{seatId}</span>
                      <motion.span
                        className="text-accent/40 group-hover:text-accent/70 transition-colors text-xs"
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        ✕
                      </motion.span>
                    </motion.button>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Max Seats Reached Message */}
      <AnimatePresence>
        {selectedSeatIds.size >= maxSelectable && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-4 py-3 bg-gold/10 border border-gold/30 rounded-lg"
          >
            <span className="text-lg">⚠️</span>
            <p className="text-xs text-gold/80 font-medium">
              Maximum {maxSelectable} seats per booking reached
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Seats Available Message */}
      {availableCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <p className="text-sm text-text-muted">
            ❌ All seats are booked for this showtime
          </p>
        </motion.div>
      )}
    </div>
  );
}