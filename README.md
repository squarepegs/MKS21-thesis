DigiQuiz
--------------

What is it?
-------------
DigiQuiz is an engine and framework for education gamification. Starting with the simple question-and-answer format of a trivia game show (much like Jeopardy), DigiQuiz creates games which can be controlled from a central dashboard by the teacher, and allow any student to play on their laptops, tablets, phones, or other Internet enabled device.

Latest Version
--------------------
Latest version is found in https://github.com/squarepegs/MKS21-thesis. 

Contributing and Questions
--------------------
For questions about the project please contact any of the developers:
Brian Boyko brian.boyko@gmail.com
Pete Do petetdo@gmail.com
or
Juan Sierra juandsierra82@gmail.com

For contribution guidelines, please review the _CONTRIBUTING.md file at this repo.

Configuration
--------------------
This application uses JSX; you will need to precompile the JSX or use one of the available CDN libraries. For more information, please see ReactJS https://facebook.github.io/react/jsx-compiler.html

We froze the version of React in the package.json 0.14. For details about this version, see http://facebook.github.io/react/blog/2015/10/07/react-v0.14.html.

Issues and Known Bugs
----------------------------

React does not play well with materialize; styling does change the rendering of certain page components: edit/create buttons do not render in the right part of the page until reload.

Similarly, on dashboard on resizing, materialize does not render react links properly. 

Decks are saved on /teacher screen but the sockets generate new room codes per reload. Teachers can enter the old room but not through the scroll down menu. The issue is most easily resolved by binding the code generated in the handler file with the deck, codes can be deleted on "end game" socket event.

On disconnect student must reload to reenter game; this is because students sockets do not reconnect directly on disconnect. The fix is a quick line of code to allow socket connect events from student clients.


Test Suite
---------------------------

The test suite was originally built with a prior server in mind: the server used an Object to map socket events rather than rely on socket.io native functionality. 

The server has since been reconfigured with the test suite revealing the bugs. Test suite needs to be rewritten.

