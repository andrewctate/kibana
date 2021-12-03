/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { shallowWithIntl as shallow } from '@kbn/test/jest';
import { AxisSettingsPopover, AxisSettingsPopoverProps } from './axis_settings_popover';
import { ToolbarPopover } from '../../shared_components';
import { layerTypes } from '../../../common';
import { EuiColorPicker } from '@elastic/eui';
import { EuiColorPickerOutput } from '@elastic/eui/src/components/color_picker/color_picker';

describe('Axes Settings', () => {
  let props: AxisSettingsPopoverProps;
  beforeEach(() => {
    props = {
      layers: [
        {
          seriesType: 'bar',
          layerType: layerTypes.DATA,
          layerId: 'first',
          splitAccessor: 'baz',
          xAccessor: 'foo',
          accessors: ['bar'],
        },
      ],
      updateTitleState: jest.fn(),
      axisTitle: 'My custom X axis title',
      axis: 'x',
      areTickLabelsVisible: true,
      areGridlinesVisible: true,
      isAxisTitleVisible: true,
      updateColor: jest.fn(),
      toggleAxisTitleVisibility: jest.fn(),
      toggleTickLabelsVisibility: jest.fn(),
      toggleGridlinesVisibility: jest.fn(),
      hasBarOrAreaOnAxis: false,
      hasPercentageAxis: false,
      orientation: 0,
      setOrientation: jest.fn(),
    };
  });

  it('should disable the popover if the isDisabled property is true', () => {
    const component = shallow(<AxisSettingsPopover {...props} isDisabled />);
    expect(component.find(ToolbarPopover).prop('isDisabled')).toEqual(true);
  });

  it('should show the axes title on the corresponding input text', () => {
    const component = shallow(<AxisSettingsPopover {...props} />);
    expect(component.find('[data-test-subj="lnsxAxisTitle"]').prop('value')).toBe(
      'My custom X axis title'
    );
  });

  it('should disable the input text if the switch is off', () => {
    const component = shallow(<AxisSettingsPopover {...props} isAxisTitleVisible={false} />);
    expect(component.find('[data-test-subj="lnsxAxisTitle"]').prop('disabled')).toBe(true);
  });

  it('has the tickLabels switch on by default', () => {
    const component = shallow(<AxisSettingsPopover {...props} />);
    expect(component.find('[data-test-subj="lnsshowxAxisTickLabels"]').prop('checked')).toBe(true);
  });

  it('has the tickLabels switch off when tickLabelsVisibilitySettings for this axes are false', () => {
    const component = shallow(
      <AxisSettingsPopover {...props} axis="yLeft" areTickLabelsVisible={false} />
    );
    expect(component.find('[data-test-subj="lnsshowyLeftAxisTickLabels"]').prop('checked')).toBe(
      false
    );
  });

  it('has the gridlines switch on by default', () => {
    const component = shallow(<AxisSettingsPopover {...props} />);
    expect(component.find('[data-test-subj="lnsshowxAxisGridlines"]').prop('checked')).toBe(true);
  });

  it('has the gridlines switch off when gridlinesVisibilitySettings for this axes are false', () => {
    const component = shallow(
      <AxisSettingsPopover {...props} axis="yRight" areGridlinesVisible={false} />
    );
    expect(component.find('[data-test-subj="lnsshowyRightAxisGridlines"]').prop('checked')).toBe(
      false
    );
  });

  it('has selected the horizontal option on the orientation group', () => {
    const component = shallow(<AxisSettingsPopover {...props} />);
    expect(
      component.find('[data-test-subj="lnsXY_axisOrientation_groups"]').prop('idSelected')
    ).toEqual('xy_axis_orientation_horizontal');
  });

  it('should have called the setOrientation function on orientation button group change', () => {
    const component = shallow(<AxisSettingsPopover {...props} />);
    component
      .find('[data-test-subj="lnsXY_axisOrientation_groups"]')
      .simulate('change', 'xy_axis_orientation_angled');
    expect(props.setOrientation).toHaveBeenCalled();
  });

  it('should disable the orientation group if the tickLabels are set to not visible', () => {
    const component = shallow(<AxisSettingsPopover {...props} areTickLabelsVisible={false} />);
    expect(
      component.find('[data-test-subj="lnsXY_axisOrientation_groups"]').prop('isDisabled')
    ).toEqual(true);
  });

  it('hides the endzone visibility flag if no setter is passed in', () => {
    const component = shallow(<AxisSettingsPopover {...props} />);
    expect(component.find('[data-test-subj="lnsshowEndzones"]').length).toBe(0);
  });

  it('shows the switch if setter is present', () => {
    const component = shallow(
      <AxisSettingsPopover {...props} endzonesVisible={true} setEndzoneVisibility={() => {}} />
    );
    expect(component.find('[data-test-subj="lnsshowEndzones"]').prop('checked')).toBe(true);
  });

  describe('manipulating axis color', () => {
    it('starts on default axis color', () => {
      const component = shallow(<AxisSettingsPopover {...props} />);
      expect(component.find(EuiColorPicker).prop('color')).toBeUndefined();
    });

    it('reports a new color choice', () => {
      const component = shallow(<AxisSettingsPopover {...props} />);

      const newColor = 'new-color';

      component.find(EuiColorPicker).prop('onChange')(newColor, {} as EuiColorPickerOutput);

      expect(props.updateColor).toHaveBeenCalledTimes(1);
      expect(props.updateColor).toHaveBeenCalledWith(props.axis, newColor);
    });
  });

  describe('axis extent', () => {
    it('hides the extent section if no extent is passed in', () => {
      const component = shallow(<AxisSettingsPopover {...props} />);
      expect(component.find('[data-test-subj="lnsXY_axisBounds_groups"]').length).toBe(0);
    });

    it('renders bound inputs if mode is custom', () => {
      const setSpy = jest.fn();
      const component = shallow(
        <AxisSettingsPopover
          {...props}
          extent={{ mode: 'custom', lowerBound: 123, upperBound: 456 }}
          setExtent={setSpy}
        />
      );
      const lower = component.find('[data-test-subj="lnsXY_axisExtent_lowerBound"]');
      const upper = component.find('[data-test-subj="lnsXY_axisExtent_upperBound"]');
      expect(lower.prop('value')).toEqual(123);
      expect(upper.prop('value')).toEqual(456);
    });
  });
});
