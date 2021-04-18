import React from 'react';
import { Overlay } from 'react-overlays';
import styled, { createGlobalStyle } from 'styled-components';

const CellContainer = styled.div`
  display: flex;
  flex: 1 0 100%;
  align-items: center;
  height: 100%;
  overflow: hidden;
  margin: 0 -5px;
  padding: 5px;
  border: 1px dashed transparent;
`;

const GlobalStyle = createGlobalStyle`
  .BaseTable__row:hover,
  .BaseTable__row--hover {
    ${CellContainer} {
      border: 1px dashed #ccc;
    }
  }
`;

const Select = styled.select`
  width: 100%;
  height: 30px;
  margin-top: 10px;
`;

interface IProps {
  container: JSX.Element;
  rowIndex: number;
  columnIndex: number;
  cellData: never;
}

interface IState {
  value: never;
  editing: boolean;
}

export default class EditableRuleCell extends React.PureComponent<IProps, IState> {
  state = {
    value: this.props.cellData,
    editing: false,
  };

  setTargetRef = (ref): void => {
    this.targetRef = ref;
  };

  getTargetRef = () => this.targetRef;

  handleClick = (): void => {
    this.setState({ editing: true });
  };

  handleHide = (): void => this.setState({ editing: false });

  handleChange = (e) => {
    this.setState({
      value: e.target.value,
      editing: false,
    });
  };

  render(): JSX.Element {
    const { container, rowIndex, columnIndex } = this.props;
    const { value, editing } = this.state;

    return (
      <CellContainer ref={this.setTargetRef} onClick={this.handleClick}>
        {!editing && value}
        {editing && this.targetRef && (
          <Overlay
            show
            flip
            rootClose
            container={container}
            target={this.getTargetRef}
            onHide={this.handleHide}
          >
            {({ props, placement }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  width: this.targetRef.offsetWidth,
                  top:
                    placement === 'top'
                      ? this.targetRef.offsetHeight
                      : -this.targetRef.offsetHeight,
                }}
              >
                <div>doggie</div>
                {/* <Select value={value} onChange={this.handleChange}>
                  <option value="grapefruit">Grapefruit</option>
                  <option value="lime">Lime</option>
                  <option value="coconut">Coconut</option>
                  <option value="mango">Mango</option>
                </Select> */}
              </div>
            )}
          </Overlay>
        )}
      </CellContainer>
    );
  }
}
