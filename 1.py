# turtle_lsystem.py
import turtle

def draw_string(s, step=30, delta=90, start=(0, 0), heading=90):
    """
    s: command string with symbols F, f, +, -
    step: segment length
    delta: turn angle in degrees ( + = left, - = right )
    start: (x, y) start position
    heading: initial heading in degrees (90 = facing up)
    """
    screen = turtle.Screen()
    t = turtle.Turtle()
    t.hideturtle()
    t.speed(0)

    t.penup()
    t.setpos(start)
    t.setheading(heading)   # 90° = “faces up” like in the figure
    t.pendown()

    for ch in s:
        if ch == 'F':
            t.forward(step)          # draw forward
        elif ch == 'f':
            t.penup(); t.forward(step); t.pendown()   # move without drawing
        elif ch == '+':
            t.left(delta)            # turn left
        elif ch == '-':
            t.right(delta)           # turn right
        # ignore any other characters

    turtle.done()

# --- Example from your image:
if __name__ == "__main__":
    cmd = "FFF-FF-F+F+FF-F-FFF"
    draw_string(cmd, step=35, delta=90, heading=90)
