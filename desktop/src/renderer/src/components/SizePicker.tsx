import { sizes, type SizeId } from '../data'
import { ChoiceGroup } from './ChoiceGroup'

type Props = {
  value: SizeId
  onChange: (value: SizeId) => void
}

// The 4 video sizes, each with a little frame in the right shape.
export function SizePicker({ value, onChange }: Props) {
  return (
    <ChoiceGroup
      legend="Size"
      name="size"
      columns="grid-cols-4"
      value={value}
      onChange={onChange}
      options={sizes.map((s) => ({
        id: s.id,
        name: `${s.name} ${s.ratio}`,
        hint: s.hint,
        visual: (
          <span className="flex h-14 items-center">
            <span
              className="block rounded-[5px] border-2 border-navy"
              style={{
                aspectRatio: `${s.width} / ${s.height}`,
                height: s.width > s.height ? '60%' : '100%'
              }}
            />
          </span>
        )
      }))}
    />
  )
}
