import { aiSlides } from './aiSlides'
import { anatomySlides } from './anatomySlides'
import { commitmentSlides } from './commitmentSlides'
import { greatSlides } from './greatSlides'
import { labSlides } from './labSlides'
import { principleSlides } from './principleSlides'
import { stakeholderSlides } from './stakeholderSlides'
import type { SlideDefinition } from './types'
import { whySlides } from './whySlides'

export const slides: SlideDefinition[] = [
  ...whySlides,
  ...greatSlides,
  ...stakeholderSlides,
  ...anatomySlides,
  ...labSlides,
  ...principleSlides,
  ...aiSlides,
  ...commitmentSlides,
]
