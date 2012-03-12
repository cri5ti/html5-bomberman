What is it?
================

A HTML5 Bomberman clone using:

 * node.js
 * socket.io
 * Backbone + Underscore
 * jQuery
 * CSS3 (via Compass + Sass)


Demo
=========

A live demo is deployed on [Amazon](http://ec2-176-34-217-95.eu-west-1.compute.amazonaws.com/).

~~Please note that due to Heroku restrictions, WebSockets are unavailable, so the game will run using polling, which is a bit slower.~~

I've moved to Amazon EC2, and socket.io is on full speed!


Why?
======

It started as a small project to help me learn the fore mentioned technologies, but in the end it turned out to be loads of fun.

I'm not proud of the code, like I said, it was just a sandbox to try things, but I believe it could be a starting point for others trying to use the above mentioned technologies.

**If you've spotted something that stinks really bad**, please, drop me a patch on how to do it better! I'm sure I've misunderstood some basic concepts, but hey, at least something is working. ;)


Getting started
===============

1. Download the **node.js** dependencies:

		npm update


2. Download and install [compass](http://compass-style.org/install/).

		gem update --system
		gem install compass


3. Compile sass to css
		
		compass compile web/


4. Start the node server.
		
		node dev-server.js


5. Open a browser to `localhost:8000` and enjoy!


