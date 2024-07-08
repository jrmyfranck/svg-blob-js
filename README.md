# SVG Blob (with JS)

A simple implementation of an SVG blob, using spline and open simplex noise. 
The SVG is dynamically generated based on the set of parameters at the start of the file.
The animation is created by stepping through a noise fields to animates the shape's control points coordinates.

I've also implemented a smooth way to start and stop the animation, based on event listeners and an animation state machine + a ramp for the acceleration/deceleration off the noise step. 
