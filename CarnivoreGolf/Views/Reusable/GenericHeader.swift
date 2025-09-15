//
//  GenericHeader.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/9/25.
//

import SwiftUI

struct GenericHeader: View {
    let title: String
    let iconName: String

    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 8) {
                if !iconName.isEmpty{
                    Image(systemName: iconName)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.primary)
                    
                }
                // Calculate responsive font size based on text length and available width
                let availableWidth = geometry.size.width - (!iconName.isEmpty ? 40 : 0) // Account for chevron and spacing
                let baseSize: CGFloat = 52  // Increased from 32
                let maxSize: CGFloat = 82   // Increased from 54
                let minSize: CGFloat = 24   // Increased from 18
                
                // Estimate text width at base size (rough approximation)
                let estimatedTextWidth = CGFloat(title.count) * (baseSize * 0.6)
                
                // Calculate scale factor based on how well the text fits
                let scaleFactor = min(1.0, availableWidth / estimatedTextWidth)
                let computedSize = max(minSize, min(maxSize, baseSize * scaleFactor))
                
                Text(title)
                    .font(.system(size: computedSize, weight: .thin, design: .default))
                    .foregroundColor(.primary)
                    .lineLimit(2)
                    .minimumScaleFactor(0.5)
                    .multilineTextAlignment(.leading)
            }
            .padding(.vertical, 16)
            .frame(width: geometry.size.width, alignment: .leading)
        }
        .frame(height: 80) // keep a reasonable default height; adjust if needed
    }
}

#Preview {
    VStack {
        GenericHeader(title: "Settings", iconName: "chevron.left")
        GenericHeader(title: "Course Management", iconName: "chevron.left")
        GenericHeader(title: "Very Long Title That Should Scale Down", iconName: "chevron.left")
    }
}
