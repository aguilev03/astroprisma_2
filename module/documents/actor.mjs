export class AstroprismaActor extends Actor {
	prepareData() {
		super.prepareData()
	}

	applyActiveEffects() {
		const mutatedEffects = []

		for (const effect of this._getApplicableEffectsForFiltering()) {
			const validChanges = effect.changes.filter((change) => this._isValidEffectChangeKey(change?.key))
			if (validChanges.length === effect.changes.length) continue

			const invalidKeys = effect.changes
				.filter((change) => !this._isValidEffectChangeKey(change?.key))
				.map((change) => change?.key)

			console.warn(`Astroprisma | Skipping invalid Active Effect changes on actor "${this.name}"`, {
				actorId: this.id,
				effectId: effect.id,
				effectName: effect.name,
				invalidKeys
			})

			mutatedEffects.push({ effect, originalChanges: effect.changes.slice() })
			effect.changes.splice(0, effect.changes.length, ...validChanges)
		}

		try {
			super.applyActiveEffects()
		} finally {
			for (const { effect, originalChanges } of mutatedEffects) {
				effect.changes.splice(0, effect.changes.length, ...originalChanges)
			}
		}
	}

	prepareBaseData() {}

	prepareDerivedData() {
		const actorData = this
		const systemData = actorData.system
		const flags = actorData.flags.astroprisma || {}

	}


	getRollData() {
		return { ...super.getRollData(), ...(this.system.getRollData?.() ?? null) }
	}

	_getApplicableEffectsForFiltering() {
		const actorEffects = this.effects?.contents ?? []
		const itemEffects = this.items?.contents?.flatMap((item) => item.effects?.contents ?? []) ?? []
		return [...actorEffects, ...itemEffects]
	}

	_isValidEffectChangeKey(key) {
		if (!key) return false
		if (!key.startsWith('system.')) return true

		const schemaPath = key.slice('system.'.length)
		const field = this.system?.schema?.getField?.(schemaPath)
		return field !== undefined
	}
}
