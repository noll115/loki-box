
enum States { OPEN, CLOSED, GETTING_MSG, DRAWING_MSG };

class StateMachine {
 private:
 public:
  StateMachine() {}
  ~StateMachine() {}
};

class State {
 private:
  State *otherStates = nullptr;

 public:
  State(State *states) : otherStates(states) {}
  ~State() {}
  virtual void init() = 0;
  virtual void update() = 0;
  virtual void onEnter() = 0;
  virtual void onExit() = 0;
};

class Open : public State {
 private:
 public:
  Open(State *states) : State(states) {}
};

class Closed : public State {
 private:
 public:
  Closed(State *states) : State(states) {}
};

class GettingMsg : public State {
 private:
 public:
  GettingMsg(State *states) : State(states) {}
};

class DrawingMsg : public State {
 private:
 public:
  DrawingMsg(State *states) : State(states) {}
};
