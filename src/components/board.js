var React = require('react')
var StompBox = require('./stomp-box')
var Amp = require('./amp')

module.exports = Board = React.createClass({
  getInitialState: function() {
    return { gadgets: this.props.gadgets }
  },
  componentDidMount: function() {
    this.rewireEffects()
  },
  swapGadgets: function(idA, idB) {
    var gadgets = this.state.gadgets.slice(0)
    var idxB = gadgets.findIndex(function(gadget) {
      return gadget.id == idB
    })
    var b = gadgets.splice(idxB, 1)
    var idxA = gadgets.findIndex(function(gadget) {
      return gadget.id == idA
    })
    if (idxB <= idxA) {
      gadgets.splice(idxA + 1, 0, b[0])
    } else {
      gadgets.splice(idxA, 0, b[0])
    }
    this.setState({ gadgets: gadgets })
  },
  rewireEffects: function() {
    var stack = [this.props.input].concat(this.state.gadgets,
      this.props.output)
    stack.reduce(function(previous, next) {
      return previous.disconnect().connect(next)
    })
  },
  serialize: function() {
    return this.state.gadgets.map(function(gadget) {
      return {
        id: gadget.id,
        name: gadget.name,
        settings: gadget.knobs.reduce(function(s, knob) {
          s[knob.label] = knob.value
          return s
        }, { on: gadget.on })
      }
    })
  },
  save: function() {
    this.props.repo.store("preset-0:bank-0", this.serialize(), function(x) {
      console.log("saved", JSON.stringify(x))
    })
  },
  render: function() {
    return (
      <div className="board">
        <header className="header">
          <h1>GuitarStack<b>.io</b></h1>
          <div className="controls">
            <button className="save" onClick={ this.save }>Save</button>
          </div>
        </header>
        {
          this.state.gadgets.map(function(gadget) {
            if (gadget.type == 'Amp') {
              return (
                <Amp
                  model={ gadget }
                  key={ gadget.id }
                  id={ gadget.id }
                  initialValues={ gadget.initialValues }
                  swapGadgets={ this.swapGadgets }
                  rewireEffects={ this.rewireEffects } />
              )
            } else {
              return (
                <StompBox
                  effect={ gadget }
                  key={ gadget.id }
                  id={ gadget.id }
                  initialValues={ gadget.initialValues }
                  swapGadgets={ this.swapGadgets }
                  rewireEffects={ this.rewireEffects } />
              )
            }
          }.bind(this))
        }
      </div>
    )
  }
})
