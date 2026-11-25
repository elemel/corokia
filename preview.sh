FONT="corokia.ttf"
OUT_FILE="preview.png"
DRAW_FILE="preview.txt"

POINT_SIZE=100
COLS=16
ROWS=8
CELL_W=50
CELL_H=100
CELL_OFFSET_X=0
CELL_BASELINE_Y=0

PAD_X=0
PAD_Y=0
BOTH_SIDES=2

ASCII_PRINTABLE_MIN=32
ASCII_PRINTABLE_MAX=126

CANVAS_W=$((CELL_W * COLS + PAD_X * BOTH_SIDES))
CANVAS_H=$((CELL_H * ROWS + PAD_Y * BOTH_SIDES))

python3 -c "
with open('$DRAW_FILE', 'w', encoding='utf-8') as f:
    for r in range($ROWS):
        for c in range($COLS):
            code = r * $COLS + c
            if $ASCII_PRINTABLE_MIN <= code <= $ASCII_PRINTABLE_MAX:
                ch = chr(code).replace('\\\\', '\\\\\\\\').replace(\"'\", \"\\\\'\")
                x = $PAD_X + c * $CELL_W + $CELL_OFFSET_X
                y = $PAD_Y + r * $CELL_H + $CELL_BASELINE_Y
                f.write(f\"text {x},{y} '{ch}'\n\")
"

gm convert -size "${CANVAS_W}x${CANVAS_H}" xc:white \
  -font "$FONT" -pointsize "$POINT_SIZE" -fill black \
  -draw "@$DRAW_FILE" \
  "$OUT_FILE"
