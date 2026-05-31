export function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
	return password.length >= 8;
}

export function isAllowedMimeType(mimeType: string, allowed: string[]): boolean {
	return allowed.includes(mimeType);
}

export function isFileSizeValid(sizeBytes: number, maxMB: number): boolean {
	return sizeBytes <= maxMB * 1024 * 1024;
}
